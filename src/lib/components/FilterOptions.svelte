<script>
  import { isAuthenticated } from '../stores/authStore.js';
  import { excludedDomains, useLabelProtection, protectedLabelIds, availableLabels } from '../stores/filterStore.js';
  import { listLabels } from '../gmail/api.js';
  import { getErrorMessage } from '../errors.js';
  import DomainExcludeInput from './DomainExcludeInput.svelte';
  import LabelSelector from './LabelSelector.svelte';

  let isExpanded = false;
  let isLoadingLabels = false;
  let labelsLoaded = false;
  let labelsError = '';

  async function fetchLabels() {
    if (labelsLoaded || isLoadingLabels) return;

    isLoadingLabels = true;
    labelsError = '';
    try {
      const result = await listLabels();
      const labels = (result.labels || [])
        .filter(l => l.type === 'user')
        .map(l => ({ id: l.id, name: l.name }))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      availableLabels.set(labels);
      labelsLoaded = true;
    } catch (error) {
      console.error('Failed to fetch labels:', error);
      labelsError = getErrorMessage(error);
    } finally {
      isLoadingLabels = false;
    }
  }

  function toggleExpanded() {
    isExpanded = !isExpanded;
    if (isExpanded && $isAuthenticated && !labelsLoaded) {
      fetchLabels();
    }
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <!-- Header / Toggle -->
  <button
    on:click={toggleExpanded}
    class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
  >
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium text-gray-700">Filter Options</span>
      {#if $excludedDomains.length > 0 || ($useLabelProtection && ($protectedLabelIds === null || $protectedLabelIds.length > 0))}
        <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
          Active
        </span>
      {/if}
    </div>
    <svg
      class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
      class:rotate-180={isExpanded}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- Expanded Content -->
  {#if isExpanded}
    <div class="px-6 pb-6 border-t border-gray-100 space-y-6">
      <!-- Excluded Domains -->
      <div class="pt-4">
        <DomainExcludeInput />
      </div>

      <!-- Label Protection Toggle -->
      <div>
        <div class="flex items-center justify-between">
          <div>
            <span class="block text-sm font-medium text-gray-700">
              Protect Labeled Threads
            </span>
            <p class="text-xs text-gray-500">
              Threads with custom labels won't appear in scan results
            </p>
          </div>
          <button
            on:click={() => useLabelProtection.update(v => !v)}
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            class:bg-slate-600={$useLabelProtection}
            class:bg-gray-200={!$useLabelProtection}
            role="switch"
            aria-checked={$useLabelProtection}
            aria-label="Toggle label protection"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              class:translate-x-6={$useLabelProtection}
              class:translate-x-1={!$useLabelProtection}
            ></span>
          </button>
        </div>
      </div>

      <!-- Label Selection (shown when protection is enabled) -->
      {#if $useLabelProtection}
        <LabelSelector {isLoadingLabels} {labelsError} />
      {/if}
    </div>
  {/if}
</div>
