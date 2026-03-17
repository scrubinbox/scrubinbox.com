/**
 * Progress Handler - Creates callbacks that update Svelte stores
 *
 * Only handles infrequent lifecycle events. Per-thread progress is
 * handled by the progressPoller reading worker.progress on a timer.
 */

import { scanTotal } from '../stores/collectionStore.js';
import { progressPercent, progressText, progressIndeterminate, addLog } from '../stores/progressStore.js';
import { hideProgress, showResults } from '../stores/uiStore.js';

/**
 * Creates a progress callback function for use with DomainCollector and DomainCleaner.
 * The returned function updates Svelte stores directly based on event type.
 */
export function createProgressHandler() {
  return async function handleProgress(type, data) {
    switch (type) {
      case 'collection_started':
        handleCollectionStarted(data);
        break;
      case 'milestone':
        handleMilestone(data);
        break;
      case 'collection_completed':
        handleCollectionCompleted(data);
        break;
      case 'cleanup_started':
        handleCleanupStarted(data);
        break;
      case 'cleanup_completed':
        handleCleanupCompleted(data);
        break;
      case 'error':
        handleError(data);
        break;
      default:
        console.warn('Unknown progress event type:', type, data);
    }
  };
}

function handleCollectionStarted(data) {
  const total = data.scan_total || 0;
  scanTotal.set(total);

  if (total > 0) {
    addLog(`Starting domain collection... (${total.toLocaleString()} total threads)`, 'info');
    progressText.set(`Scanning ${total.toLocaleString()} inbox threads...`);
  } else {
    addLog('Starting domain collection...', 'info');
    progressText.set('Scanning inbox threads...');
  }

  progressIndeterminate.set(false);
  progressPercent.set(0);
}

function handleMilestone(data) {
  const { scanned, collected, scan_total, unique_domains } = data;
  const scannedText = scan_total > 0
    ? `Scanned ${scanned.toLocaleString()}/${scan_total.toLocaleString()} threads`
    : `Scanned ${scanned.toLocaleString()} threads`;
  addLog(
    `${scannedText}, collected ${collected.toLocaleString()}, ${unique_domains.toLocaleString()} domains found`,
    'info'
  );
}

function handleCollectionCompleted(data) {
  const { collected, unique_domains } = data;
  addLog(`Collection complete: ${collected} threads collected, ${unique_domains} domains found`, 'success');

  progressIndeterminate.set(false);
  progressPercent.set(100);
  progressText.set('Collection complete!');
}

function handleCleanupStarted(data) {
  const { process_total, dry_run } = data;
  const mode = dry_run ? 'preview' : 'cleanup';
  addLog(`Starting ${mode} for ${process_total} threads...`, 'info');
  progressText.set(`${dry_run ? 'Previewing' : 'Cleaning'} selected domains...`);
}

function handleCleanupCompleted(data) {
  const { threads_processed, threads_deleted } = data;
  addLog(`Cleanup complete: ${threads_deleted}/${threads_processed} threads deleted`, 'success');

  hideProgress();
  showResults(data);
}

function handleError(data) {
  addLog(`Error: ${data.message}`, 'error');
  hideProgress();
}
