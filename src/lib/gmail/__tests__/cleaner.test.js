/**
 * Tests for DomainCleaner class
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DomainCleaner } from '../cleaner.js';
import { CleanerConfig } from '../../models/index.js';
import { sampleInbox, createApiMocks, setupApiMocks } from './testUtils.js';

// Top-level mock with vi.fn() stubs — hoisted safely
vi.mock('../api.js', () => ({
  getInboxInfo: vi.fn(),
  getProfile: vi.fn(),
  getLabelInfo: vi.fn(),
  listThreads: vi.fn(),
  getThread: vi.fn(),
  trashThread: vi.fn(),
}));

import * as api from '../api.js';

// === Sample Thread Data ===

function makeCleanupThread(threadId, domain, subject, sender, messageCount = 1) {
  return {
    thread_id: threadId,
    domain,
    subject,
    sender,
    message_count: messageCount,
  };
}

function sampleThreads() {
  return [
    makeCleanupThread('thread_001', 'spam.com', 'Buy now!', 'promo@spam.com', 2),
    makeCleanupThread('thread_002', 'spam.com', 'Limited offer', 'deals@spam.com', 1),
    makeCleanupThread('thread_003', 'junk.com', 'You won!', 'winner@junk.com', 3),
  ];
}

// Track mocks at module level so we can check trashedThreads in assertions
let currentMocks;

// === Cleanup Tests ===

describe('cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMocks = setupApiMocks(api, sampleInbox());
  });

  it('trashes threads by default', async () => {
    const cleaner = new DomainCleaner(new CleanerConfig());
    const result = await cleaner.cleanup(sampleThreads());

    expect(result.threads_processed).toBe(3);
    expect(result.threads_deleted).toBe(3);
    expect(result.threads_failed_to_delete).toBe(0);

    expect(currentMocks.trashedThreads.size).toBe(3);
    expect(currentMocks.trashedThreads.has('thread_001')).toBe(true);
    expect(currentMocks.trashedThreads.has('thread_002')).toBe(true);
    expect(currentMocks.trashedThreads.has('thread_003')).toBe(true);
  });

  it('empty thread list returns zero stats', async () => {
    const cleaner = new DomainCleaner(new CleanerConfig());
    const result = await cleaner.cleanup([]);

    expect(result.threads_processed).toBe(0);
    expect(result.threads_deleted).toBe(0);
    expect(result.threads_failed_to_delete).toBe(0);
  });

  it('handles trash error gracefully', async () => {
    currentMocks = setupApiMocks(api, sampleInbox(), { failThreads: new Set(['thread_001']) });

    const cleaner = new DomainCleaner(new CleanerConfig());
    const result = await cleaner.cleanup(sampleThreads());

    expect(result.threads_processed).toBe(3);
    expect(result.threads_deleted).toBe(2);
    expect(result.threads_failed_to_delete).toBe(1);
  });

  it('calls progress callback with lifecycle events', async () => {
    const progressEvents = [];
    const callback = async (event, data) => progressEvents.push([event, data]);

    const cleaner = new DomainCleaner(new CleanerConfig(), callback);
    await cleaner.cleanup(sampleThreads());

    const eventTypes = progressEvents.map(e => e[0]);
    expect(eventTypes).toContain('cleanup_started');
    expect(eventTypes).toContain('cleanup_completed');
  });

  it('updates progress object during cleanup', async () => {
    const cleaner = new DomainCleaner(new CleanerConfig());

    expect(cleaner.progress.status).toBe('idle');
    expect(cleaner.progress.processed).toBe(0);

    await cleaner.cleanup(sampleThreads());

    expect(cleaner.progress.status).toBe('completed');
    expect(cleaner.progress.processed).toBe(3);
    expect(cleaner.progress.deleted).toBe(3);
  });
});

// === Build Stats Tests ===

describe('buildStats', () => {
  it('includes all fields', () => {
    const result = DomainCleaner.buildStats(10, 8, 2);

    expect(result.threads_processed).toBe(10);
    expect(result.threads_deleted).toBe(8);
    expect(result.threads_failed_to_delete).toBe(2);
  });

  it('handles all zeros', () => {
    const result = DomainCleaner.buildStats(0, 0, 0);

    expect(result.threads_processed).toBe(0);
    expect(result.threads_deleted).toBe(0);
    expect(result.threads_failed_to_delete).toBe(0);
  });
});

// === Interrupt Handling Tests ===

describe('interrupt handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupApiMocks(api, sampleInbox());
  });

  it('stops when interrupted flag is set', async () => {
    const cleaner = new DomainCleaner(new CleanerConfig());

    cleaner.progressCallback = async (event) => {
      if (event === 'cleanup_started') {
        cleaner.interrupted = true;
      }
    };

    const result = await cleaner.cleanup(sampleThreads());

    expect(result.threads_processed).toBeLessThan(sampleThreads().length);
  });
});
