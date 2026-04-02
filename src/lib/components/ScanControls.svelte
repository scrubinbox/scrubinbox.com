<script>
  import { isAuthenticated } from '../stores/authStore.js';
  import { isCollecting, domains, collectionResult } from '../stores/collectionStore.js';
  import { selectedDomains, expandedDomains } from '../stores/cleanupStore.js';
  import { errorMessage } from '../stores/progressStore.js';
  import { excludedDomains, excludedLabelIds } from '../stores/filterStore.js';
  import { showProgress, hideProgress, showDomains } from '../stores/uiStore.js';

  import { CollectorConfig } from '../models/index.js';
  import { DomainCollector } from '../gmail/collector.js';
  import { createProgressHandler } from '../gmail/progressHandler.js';
  import { startProgressPolling, stopProgressPolling } from '../gmail/progressPoller.js';
  import { getErrorMessage } from '../errors.js';

  let includeArchived = false;
  let activeCollector = null;

  async function collectDomains() {
    if ($isCollecting) return;

    $isCollecting = true;
    $selectedDomains = new Set();
    $expandedDomains = new Set();
    showProgress();

    const config = new CollectorConfig({
      excludedDomains: new Set($excludedDomains),
      useLabelExclusion: $excludedLabelIds === null || $excludedLabelIds.length > 0,
      excludedLabelIds: $excludedLabelIds ? new Set($excludedLabelIds) : null,
      includeArchived,
    });

    const progressHandler = createProgressHandler();
    const collector = new DomainCollector(config, progressHandler);
    activeCollector = collector;
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
      errorMessage.set(`Collection failed: ${getErrorMessage(error)}`);
      hideProgress();
    } finally {
      stopProgressPolling();
      activeCollector = null;
      $isCollecting = false;
    }
  }

  function stopScan() {
    if (activeCollector) {
      activeCollector.interrupted = true;
    }
  }

  $: collectDisabled = !$isAuthenticated || $isCollecting;
</script>

<div class="bg-white rounded-xl shadow-sm p-5 border border-sage-200">
  <div class="flex flex-wrap items-center gap-3">
    {#if $isCollecting}
      <button
        on:click={stopScan}
        class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
      >
        Stop Scan
      </button>
    {:else}
      <button
        on:click={collectDomains}
        disabled={collectDisabled}
        class="bg-sage-600 hover:bg-sage-700 text-white font-semibold py-2 px-5 rounded-lg disabled:bg-sage-200 disabled:cursor-not-allowed transition-colors text-sm"
      >
        Scan Inbox
      </button>
    {/if}

    <label class="flex items-center gap-1.5 text-xs font-medium text-sage-400 cursor-pointer select-none">
      <input
        type="checkbox"
        bind:checked={includeArchived}
        class="rounded border-sage-300 text-sage-600 focus:ring-sage-300"
      />
      Include archived
    </label>
  </div>
</div>
