/**
 * Application-wide constants
 */

// Subject line truncation limits for display
export const SUBJECT_TRUNCATE_COLLECTOR = 60;
export const SUBJECT_TRUNCATE_CLEANER = 50;

// How often the UI polls the worker's progress object (ms)
export const PROGRESS_POLL_INTERVAL_MS = 100;

// Yield to the macrotask queue every N threads so setInterval (poller) can fire
export const MACROTASK_YIELD_INTERVAL = 50;

// Gmail API page size for listing threads
export const THREAD_PAGE_SIZE = 100;


// Number of concurrent Gmail API calls (per-user quota ~250 units/sec)
export const API_CONCURRENCY = 5;
