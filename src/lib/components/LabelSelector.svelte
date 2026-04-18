<script>
  import { isAuthenticated } from '../stores/authStore.js';
  import { excludedLabelIds, availableLabels } from '../stores/filterStore.js';

  export let isLoadingLabels = false;
  export let labelsError = '';

  function handleLabelToggle(labelId) {
    if ($excludedLabelIds === null) {
      // "All" is selected — uncheck this one, keep the rest
      excludedLabelIds.set($availableLabels.map(l => l.id).filter(id => id !== labelId));
    } else if ($excludedLabelIds.includes(labelId)) {
      const updated = $excludedLabelIds.filter(id => id !== labelId);
      excludedLabelIds.set(updated.length > 0 ? updated : null);
    } else {
      const updated = [...$excludedLabelIds, labelId];
      // If all labels are now selected, collapse back to null
      excludedLabelIds.set(updated.length >= $availableLabels.length ? null : updated);
    }
  }

  function selectAllLabels() {
    excludedLabelIds.set(null);
  }

  function selectNoLabels() {
    excludedLabelIds.set([]);
  }

  $: allLabelsSelected = $excludedLabelIds === null;
  $: noLabelsSelected = $excludedLabelIds !== null && $excludedLabelIds.length === 0;
</script>

<div>
  <div class="flex items-center justify-between mb-2">
    <span class="block text-sm font-medium text-sage-700">
      Exclude labeled threads
    </span>
    <div class="flex gap-2">
      <button
        on:click={selectAllLabels}
        class="text-xs text-sage-500 hover:text-sage-700"
        class:font-semibold={allLabelsSelected}
      >
        All
      </button>
      <span class="text-sage-200">|</span>
      <button
        on:click={selectNoLabels}
        class="text-xs text-sage-500 hover:text-sage-700"
        class:font-semibold={noLabelsSelected}
      >
        None
      </button>
    </div>
  </div>
  <p class="text-xs text-sage-400 mb-2.5">
    {#if allLabelsSelected}
      Threads with selected labels will be excluded from scan
    {:else if noLabelsSelected}
      No labels excluded (only starred/important threads are excluded)
    {:else}
      Threads with selected labels will be excluded from scan
    {/if}
  </p>

  {#if !$isAuthenticated}
    <p class="text-xs text-sage-300 italic">
      Authenticate to load your Gmail labels
    </p>
  {:else if isLoadingLabels}
    <div class="flex items-center gap-2 text-xs text-sage-400">
      <svg class="animate-spin h-4 w-4 text-sage-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span>Loading labels...</span>
    </div>
  {:else if labelsError}
    <p class="text-xs text-red-500">{labelsError}</p>
  {:else if $availableLabels.length === 0}
    <p class="text-xs text-sage-300 italic">No custom labels found</p>
  {:else}
    <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-sage-50 rounded-lg border border-sage-100">
      {#each $availableLabels as label}
        <button
          on:click={() => handleLabelToggle(label.id)}
          class="px-3 py-1.5 text-xs rounded-full border transition-colors"
          class:bg-sage-500={allLabelsSelected || ($excludedLabelIds && $excludedLabelIds.includes(label.id))}
          class:text-white={allLabelsSelected || ($excludedLabelIds && $excludedLabelIds.includes(label.id))}
          class:border-sage-500={allLabelsSelected || ($excludedLabelIds && $excludedLabelIds.includes(label.id))}
          class:bg-white={!allLabelsSelected && (!$excludedLabelIds || !$excludedLabelIds.includes(label.id))}
          class:text-sage-600={!allLabelsSelected && (!$excludedLabelIds || !$excludedLabelIds.includes(label.id))}
          class:border-sage-200={!allLabelsSelected && (!$excludedLabelIds || !$excludedLabelIds.includes(label.id))}
        >
          {label.name}
        </button>
      {/each}
    </div>
  {/if}
</div>
