<script>
  import { isAuthenticated } from '../stores/authStore.js';
  import { isCollecting, domains, collectionResult, hasCollectedDomains } from '../stores/collectionStore.js';
  import { isCleaning, hasSelection, selectedDomains } from '../stores/cleanupStore.js';
  import { addLog } from '../stores/progressStore.js';
  import { excludedDomains, excludedLabelIds } from '../stores/filterStore.js';
  import { showProgress, hideProgress, showDomains } from '../stores/uiStore.js';

  import { CollectorConfig, CleanerConfig } from '../models/index.js';
  import { DomainCollector } from '../gmail/collector.js';
  import { DomainCleaner } from '../gmail/cleaner.js';
  import { createProgressHandler } from '../gmail/progressHandler.js';
  import { startProgressPolling, stopProgressPolling } from '../gmail/progressPoller.js';
  import { getErrorMessage } from '../errors.js';

  let collectBtnText = 'Scan Inbox';
  let scanLimitInput = '';
  let includeArchived = false;

  async function collectDomains() {
    if ($isCollecting) return;

    $isCollecting = true;
    showProgress();
    collectBtnText = 'Scanning...';

    const limit = scanLimitInput ? parseInt(scanLimitInput, 10) : null;

    const config = new CollectorConfig({
      limit,
      excludedDomains: new Set($excludedDomains),
      useLabelExclusion: $excludedLabelIds === null || $excludedLabelIds.length > 0,
      excludedLabelIds: $excludedLabelIds ? new Set($excludedLabelIds) : null,
      includeArchived,
    });

    const progressHandler = createProgressHandler();
    const collector = new DomainCollector(config, progressHandler);
    startProgressPolling(collector, 'collection');

    try {
      const result = await collector.collect();

      $collectionResult = result;
      $domains = result.getSortedDomainMap();

      setTimeout(() => {
        hideProgress();
        showDomains();
      }, 1000);
    } catch (error) {
      console.error('Collection error:', error);
      addLog(`Collection failed: ${getErrorMessage(error)}`, 'error');
      hideProgress();
    } finally {
      stopProgressPolling();
      $isCollecting = false;
      collectBtnText = 'Scan Inbox';
    }
  }

  async function performCleanup(dryRun) {
    if ($isCleaning) return;

    if (!dryRun) {
      if (!confirm('Are you sure you want to delete the selected domains? This action cannot be undone.')) {
        return;
      }
    }

    $isCleaning = true;
    showProgress();

    const threads = $collectionResult.getCleanupThreads($selectedDomains);

    const config = new CleanerConfig({ dryRun });
    const progressHandler = createProgressHandler();
    const cleaner = new DomainCleaner(config, progressHandler);
    startProgressPolling(cleaner, 'cleanup');

    try {
      await cleaner.cleanup(threads);
    } catch (error) {
      addLog(`Cleanup failed: ${getErrorMessage(error)}`, 'error');
      hideProgress();
    } finally {
      stopProgressPolling();
      $isCleaning = false;
    }
  }

  function previewCleanup() {
    performCleanup(true);
  }

  function executeCleanup() {
    performCleanup(false);
  }

  $: collectDisabled = !$isAuthenticated || $isCollecting;
  $: previewDisabled = !$hasCollectedDomains || !$hasSelection || $isCleaning;
  $: cleanupDisabled = !$hasCollectedDomains || !$hasSelection || $isCleaning;
</script>

<div class="bg-white rounded-xl shadow-sm p-5 border border-sage-200">
  <div class="flex flex-col gap-4">
    <!-- Scan Controls -->
    <div class="flex flex-wrap items-center gap-3">
      <button
        on:click={collectDomains}
        disabled={collectDisabled}
        class="bg-sage-600 hover:bg-sage-700 text-white font-semibold py-2 px-5 rounded-lg disabled:bg-sage-200 disabled:cursor-not-allowed transition-colors text-sm"
      >
        {collectBtnText}
      </button>

      <div class="flex items-center gap-2">
        <label for="scan-limit" class="text-xs font-medium text-sage-400">Limit:</label>
        <input
          id="scan-limit"
          type="number"
          bind:value={scanLimitInput}
          placeholder="All"
          min="1"
          class="w-20 px-2.5 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent text-sm text-sage-700"
        />
      </div>

      <label class="flex items-center gap-1.5 text-xs font-medium text-sage-400 cursor-pointer select-none">
        <input
          type="checkbox"
          bind:checked={includeArchived}
          class="rounded border-sage-300 text-sage-600 focus:ring-sage-300"
        />
        Include archived
      </label>
    </div>

    <!-- Cleanup Controls -->
    {#if $hasCollectedDomains}
      <div class="flex flex-wrap gap-2 pt-2 border-t border-sage-100">
        <button
          on:click={previewCleanup}
          disabled={previewDisabled}
          class="bg-sage-100 hover:bg-sage-200 text-sage-700 font-medium py-2 px-4 rounded-lg disabled:bg-sage-50 disabled:text-sage-300 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Preview Cleanup
        </button>
        <button
          on:click={executeCleanup}
          disabled={cleanupDisabled}
          class="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-medium py-2 px-4 rounded-lg disabled:bg-sage-50 disabled:text-sage-300 disabled:cursor-not-allowed transition-colors text-sm border border-red-200 disabled:border-sage-100"
        >
          Delete Selected
        </button>
      </div>
    {/if}
  </div>
</div>
