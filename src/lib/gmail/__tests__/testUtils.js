/**
 * Test utilities for Gmail modules
 */

/**
 * Create a thread dict matching Gmail API structure.
 */
export function makeThread(threadId, sender, subject, labels = ['INBOX'], messageCount = 1) {
  const messages = [];
  for (let i = 0; i < messageCount; i++) {
    messages.push({
      id: `${threadId}_msg_${i}`,
      labelIds: labels,
      payload: {
        headers: [
          { name: 'From', value: sender },
          { name: 'Subject', value: subject },
        ],
      },
    });
  }

  return {
    id: threadId,
    labelIds: labels,
    messages,
  };
}

/**
 * Create a thread with no messages (edge case).
 */
export function makeThreadNoMessages(threadId) {
  return {
    id: threadId,
    labelIds: ['INBOX'],
    messages: [],
  };
}

/**
 * Create a thread with missing From header.
 */
export function makeThreadNoFromHeader(threadId, subject) {
  return {
    id: threadId,
    labelIds: ['INBOX'],
    messages: [{
      id: `${threadId}_msg_0`,
      labelIds: ['INBOX'],
      payload: {
        headers: [
          { name: 'Subject', value: subject },
        ],
      },
    }],
  };
}

/**
 * Returns a realistic inbox data structure with various thread types.
 */
export function sampleInbox() {
  const threads = [
    // Regular collectible threads
    makeThread('thread_001', 'Newsletter <newsletter@spam.com>', 'Buy now! 50% off', ['INBOX']),
    makeThread('thread_002', 'Promo <promo@spam.com>', 'Limited time offer', ['INBOX']),
    makeThread('thread_003', 'Updates <updates@social.com>', 'New friend request', ['INBOX']),

    // Protected threads
    makeThread('thread_004', 'Boss <boss@important.com>', 'Q4 Review', ['INBOX', 'IMPORTANT']),
    makeThread('thread_005', 'Friend <friend@starred.com>', 'Party invite', ['INBOX', 'STARRED']),
    makeThread('thread_006', 'Bank <bank@labeled.com>', 'Statement', ['INBOX', 'Label_12345']),

    // Multi-message thread
    makeThread('thread_007', 'Support <support@multi.com>', 'Ticket #1234', ['INBOX'], 3),

    // Plain email format (no angle brackets)
    makeThread('thread_008', 'plain@edge.com', 'Plain sender format', ['INBOX']),

    // Archived thread (no INBOX label)
    makeThread('thread_011', 'Old <old@archived.com>', 'Old newsletter', []),

    // Edge cases
    makeThreadNoMessages('thread_009'),
    makeThreadNoFromHeader('thread_010', 'No sender thread'),
  ];

  return {
    threadsTotal: threads.length,
    threads,
  };
}

/**
 * Create mock implementations for the api.js module functions.
 *
 * @param {object} inboxData - The inbox data from sampleInbox() or similar
 * @param {object} options - Options like { failThreads: new Set(['thread_001']) }
 * @returns {object} Mock implementations for api.js functions + trashed tracking
 */
export function createApiMocks(inboxData, { failThreads = new Set() } = {}) {
  const threadsById = {};
  for (const t of (inboxData.threads || [])) {
    threadsById[t.id] = t;
  }

  const trashedThreads = new Set();

  return {
    trashedThreads,

    getInboxInfo: async () => ({
      id: 'INBOX',
      name: 'INBOX',
      threadsTotal: inboxData.threadsTotal || 0,
    }),

    getProfile: async () => ({
      emailAddress: 'test@gmail.com',
      threadsTotal: inboxData.threadsTotal || 0,
    }),

    getLabelInfo: async (labelId) => ({
      id: labelId,
      threadsTotal: 0,
    }),

    listLabels: async () => ({
      labels: [],
    }),

    listThreads: async ({ maxResults = 100, pageToken = null, q = 'in:inbox' } = {}) => {
      const allThreads = inboxData.threads || [];
      // Filter by query: 'in:inbox' returns only threads with INBOX label,
      // anything else (e.g. '-in:trash -in:spam') returns all threads.
      const threads = q === 'in:inbox'
        ? allThreads.filter(t => (t.labelIds || []).includes('INBOX'))
        : allThreads;
      const startIdx = pageToken ? parseInt(pageToken) : 0;
      const endIdx = Math.min(startIdx + maxResults, threads.length);
      const pageThreads = threads.slice(startIdx, endIdx).map(t => ({ id: t.id }));

      const result = { threads: pageThreads };
      if (endIdx < threads.length) {
        result.nextPageToken = String(endIdx);
      }

      return result;
    },

    getThread: async (threadId) => {
      const thread = threadsById[threadId];
      if (thread) return thread;
      return { id: threadId, messages: [] };
    },

    trashThread: async (threadId) => {
      if (failThreads.has(threadId)) {
        const error = new Error('Thread not found');
        error.status = 404;
        throw error;
      }
      trashedThreads.add(threadId);
      return { id: threadId, labelIds: ['TRASH'] };
    },
  };
}

/**
 * Wire vi.fn() mocks from a vi.mock()'d api module to createApiMocks implementations.
 *
 * Note: vi.mock() calls must remain per-file due to Vitest hoisting. This helper only
 * replaces the repetitive mockImplementation wiring, not the vi.mock() declaration.
 *
 * @param {object} api - The mocked api module (import * as api from '../api.js')
 * @param {object} inboxData - Inbox data from sampleInbox() or similar
 * @param {object} options - Options passed to createApiMocks
 * @returns {object} The mocks object (with trashedThreads etc.)
 */
export function setupApiMocks(api, inboxData, options) {
  const mocks = createApiMocks(inboxData, options);

  api.getInboxInfo.mockImplementation(mocks.getInboxInfo);
  if (api.getProfile) api.getProfile.mockImplementation(mocks.getProfile);
  if (api.getLabelInfo) api.getLabelInfo.mockImplementation(mocks.getLabelInfo);
  api.listThreads.mockImplementation(mocks.listThreads);
  api.getThread.mockImplementation(mocks.getThread);
  api.trashThread.mockImplementation(mocks.trashThread);

  return mocks;
}
