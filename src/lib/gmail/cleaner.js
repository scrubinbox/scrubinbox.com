/**
 * Domain Cleaner - Handles email cleanup for selected domains
 */

import { trashThread, deleteThread } from './api.js';
import { CleanupStats } from '../models/index.js';
import { API_CONCURRENCY } from '../constants.js';
import { asyncPool } from '../asyncPool.js';


export class DomainCleaner {
  constructor(config, progressCallback = null) {
    this.config = config;
    this.progressCallback = progressCallback;
    this.interrupted = false;

    // Pollable progress state — UI reads this via setInterval
    this.progress = {
      processed: 0,
      processTotal: 0,
      deleted: 0,
      dryRun: false,
      permanentDelete: false,
      status: 'idle',
    };
  }

  // === Main Entry Point ===

  async cleanup(threads) {
    if (!threads || threads.length === 0) {
      return DomainCleaner.buildStats(0, 0, 0, 0);
    }

    // Initialize pollable progress
    this.progress.processTotal = threads.length;
    this.progress.dryRun = this.config.dryRun;
    this.progress.permanentDelete = this.config.permanentDelete;
    this.progress.status = 'running';
    this.progress.processed = 0;
    this.progress.deleted = 0;

    await this._reportProgress('cleanup_started', {
      dry_run: this.config.dryRun,
      process_total: threads.length,
    });

    let totalProcessed = 0;
    let threadsDeleted = 0;
    let messagesDeleted = 0;
    let messagesKept = 0;

    if (this.config.dryRun) {
      // No API calls — simple sequential loop
      for (const thread of threads) {
        if (this.interrupted) break;

        threadsDeleted += 1;
        messagesDeleted += thread.message_count;
        totalProcessed += 1;

        this.progress.processed = totalProcessed;
        this.progress.deleted = threadsDeleted;
      }
    } else {
      // Batch trash calls concurrently
      const results = await asyncPool(threads, API_CONCURRENCY, async (thread) => {
        return { thread, success: await this._removeThread(thread.thread_id) };
      });

      for (const { thread, success } of results) {
        if (this.interrupted) break;

        if (success) {
          threadsDeleted += 1;
          messagesDeleted += thread.message_count;
        } else {
          messagesKept += thread.message_count;
        }

        totalProcessed += 1;

        this.progress.processed = totalProcessed;
        this.progress.deleted = threadsDeleted;
      }
    }

    this.progress.status = 'completed';

    const result = DomainCleaner.buildStats(totalProcessed, threadsDeleted, messagesDeleted, messagesKept);
    await this._reportProgress('cleanup_completed', result);

    return result;
  }

  // === Thread Processing ===

  async _removeThread(threadId) {
    try {
      if (this.config.permanentDelete) {
        await deleteThread(threadId);
      } else {
        await trashThread(threadId);
      }
      return true;
    } catch (error) {
      console.error(`Error removing thread ${threadId}:`, error);
      return false;
    }
  }

  // === Progress ===

  async _reportProgress(event, data) {
    if (this.progressCallback) {
      await this.progressCallback(event, data);
    }
  }

  // === Results ===

  static buildStats(processed, deleted, messagesDeleted, kept) {
    return new CleanupStats({
      threads_processed: processed,
      threads_deleted: deleted,
      messages_deleted: messagesDeleted,
      messages_kept: kept,
    });
  }
}
