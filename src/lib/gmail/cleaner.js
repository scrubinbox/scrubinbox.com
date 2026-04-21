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
      permanentDelete: false,
      status: 'idle',
    };
  }

  // === Main Entry Point ===

  async cleanup(threads) {
    if (!threads || threads.length === 0) {
      return DomainCleaner.buildStats(0, 0, 0, []);
    }

    // Initialize pollable progress
    this.progress.processTotal = threads.length;
    this.progress.permanentDelete = this.config.permanentDelete;
    this.progress.status = 'running';
    this.progress.processed = 0;
    this.progress.deleted = 0;

    await this._reportProgress('cleanup_started', {
      process_total: threads.length,
    });

    let totalProcessed = 0;
    let threadsDeleted = 0;
    let threadsFailed = 0;
    const deletedThreads = [];

    await asyncPool(threads, API_CONCURRENCY, async (thread) => {
      if (this.interrupted) return;

      const success = await this._removeThread(thread.thread_id);

      if (success) {
        threadsDeleted += 1;
        deletedThreads.push(thread);
      } else {
        threadsFailed += 1;
      }

      totalProcessed += 1;
      this.progress.processed = totalProcessed;
      this.progress.deleted = threadsDeleted;
    });

    this.progress.status = 'completed';

    const result = DomainCleaner.buildStats(totalProcessed, threadsDeleted, threadsFailed, deletedThreads, this.config.permanentDelete);
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

  static buildStats(processed, deleted, failed, deletedThreads = [], permanentDelete = false) {
    return new CleanupStats({
      threads_processed: processed,
      threads_deleted: deleted,
      threads_failed_to_delete: failed,
      deleted_threads: deletedThreads,
      permanent_delete: permanentDelete,
    });
  }
}
