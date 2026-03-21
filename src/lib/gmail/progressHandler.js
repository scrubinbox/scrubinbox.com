/**
 * Progress Handler - Creates callbacks for lifecycle events
 *
 * Handles start/complete/error events. The progressPoller handles
 * all progress bar and text updates during collection/cleanup.
 */

import { scanTotal } from '../stores/collectionStore.js';
import { progressPercent, progressIndeterminate, errorMessage } from '../stores/progressStore.js';
import { hideProgress, showResults } from '../stores/uiStore.js';

export function createProgressHandler() {
  return async function handleProgress(type, data) {
    switch (type) {
      case 'collection_started': {
        const total = data.scan_total || 0;
        scanTotal.set(total);
        progressIndeterminate.set(false);
        progressPercent.set(0);
        errorMessage.set('');
        break;
      }
      case 'collection_completed':
        break; // poller handles the 100% state
      case 'cleanup_started':
        errorMessage.set('');
        break;
      case 'cleanup_completed':
        hideProgress();
        showResults(data);
        break;
      case 'error':
        errorMessage.set(data.message);
        hideProgress();
        break;
    }
  };
}
