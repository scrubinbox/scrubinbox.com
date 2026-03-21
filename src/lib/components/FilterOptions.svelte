<script>
  import { isAuthenticated } from '../stores/authStore.js';
  import { excludedDomains, protectedLabelIds, availableLabels } from '../stores/filterStore.js';
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
    if (!$isAuthenticated) return;
    isExpanded = !isExpanded;
    if (isExpanded && !labelsLoaded) {
      fetchLabels();
    }
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-sage-200 overflow-hidden">
  <button
    on:click={toggleExpanded}
    disabled={!$isAuthenticated}
    class="w-full px-5 py-3.5 flex items-center justify-between transition-colors"
    class:hover:bg-sage-50={$isAuthenticated}
    class:opacity-40={!$isAuthenticated}
    class:cursor-not-allowed={!$isAuthenticated}
  >
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
      <span class="text-sm font-medium text-sage-700">Filter Options</span>
      {#if $excludedDomains.length > 0 || $protectedLabelIds === null || ($protectedLabelIds && $protectedLabelIds.length > 0)}
        <span class="px-2 py-0.5 bg-sage-100 text-sage-600 text-xs font-medium rounded-full">
          Active
        </span>
      {/if}
    </div>
    <svg
      class="w-4 h-4 text-sage-300 transform transition-transform duration-200"
      class:rotate-180={isExpanded}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isExpanded}
    <div class="px-5 pb-5 border-t border-sage-100 space-y-5">
      <div class="pt-4">
        <DomainExcludeInput />
      </div>

      <LabelSelector {isLoadingLabels} {labelsError} />
    </div>
  {/if}
</div>
