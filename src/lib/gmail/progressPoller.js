/**
 * Progress Poller - Reads worker.progress on a timer and writes to Svelte stores
 */

import { progressPercent, progressText, progressIndeterminate, progressDeletedThreads } from '../stores/progressStore.js';
import { PROGRESS_POLL_INTERVAL_MS } from '../constants.js';

let intervalId = null;

/**
 * Start polling a worker's .progress object and writing to Svelte stores.
 * @param {object} worker - A DomainCollector or DomainCleaner instance with a .progress property
 * @param {'collection' | 'cleanup'} mode
 */
export function startProgressPolling(worker, mode) {
  stopProgressPolling();

  intervalId = setInterval(() => {
    const p = worker.progress;
    if (!p || p.status === 'idle') return;

    if (mode === 'collection') {
      pollCollection(p);
    } else if (mode === 'cleanup') {
      pollCleanup(p);
    }
  }, PROGRESS_POLL_INTERVAL_MS);
}

/**
 * Stop the progress polling interval.
 */
export function stopProgressPolling() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function pollCollection(p) {
  const { status, scanned, scanTotal, collected, uniqueDomains } = p;

  if (status === 'completed') {
    progressIndeterminate.set(false);
    progressPercent.set(100);
    progressText.set(`Collection complete — ${collected.toLocaleString()} threads in ${uniqueDomains.toLocaleString()} domains`);
    return;
  }

  if (scanTotal > 0) {
    const percentage = Math.min(Math.round((scanned / scanTotal) * 100), 99);
    progressIndeterminate.set(false);
    progressPercent.set(percentage);
    progressText.set(
      `Scanned ${scanned.toLocaleString()}/${scanTotal.toLocaleString()} threads, found ${collected.toLocaleString()} under ${uniqueDomains.toLocaleString()} sender domains`
    );
  } else {
    progressIndeterminate.set(true);
    progressPercent.set(100);
    progressText.set(
      `Scanned ${scanned.toLocaleString()} threads, found ${collected.toLocaleString()} under ${uniqueDomains.toLocaleString()} sender domains`
    );
  }
}

function pollCleanup(p) {
  const { processed, processTotal, deleted, permanentDelete, deletedThreads } = p;
  const action = permanentDelete ? 'Deleting' : 'Trashing';

  if (processTotal > 0) {
    const percentage = Math.round((processed / processTotal) * 100);
    progressIndeterminate.set(false);
    progressPercent.set(percentage);
    const verb = permanentDelete ? 'deleted' : 'trashed';
    progressText.set(
      `${action}: ${processed}/${processTotal} threads (${deleted} ${verb})`
    );
  } else {
    progressText.set(`${action}...`);
  }

  progressDeletedThreads.set(deletedThreads || []);
}
