<script>
  import { isAuthenticated } from '../stores/authStore.js';
  import { protectedLabelIds, availableLabels } from '../stores/filterStore.js';

  export let isLoadingLabels = false;
  export let labelsError = '';

  function handleLabelToggle(labelId) {
    if ($protectedLabelIds === null) {
      // Currently protecting all - switch to only this one
      protectedLabelIds.set([labelId]);
    } else if ($protectedLabelIds.includes(labelId)) {
      // Remove this label
      const updated = $protectedLabelIds.filter(id => id !== labelId);
      protectedLabelIds.set(updated.length > 0 ? updated : null);
    } else {
      // Add this label
      protectedLabelIds.set([...$protectedLabelIds, labelId]);
    }
  }

  function selectAllLabels() {
    protectedLabelIds.set(null);  // null means all
  }

  function selectNoLabels() {
    protectedLabelIds.set([]);  // empty array means none
  }

  $: allLabelsSelected = $protectedLabelIds === null;
  $: noLabelsSelected = $protectedLabelIds !== null && $protectedLabelIds.length === 0;
</script>

<div>
  <div class="flex items-center justify-between mb-2">
    <span class="block text-sm font-medium text-gray-700">
      Select Labels to Protect
    </span>
    <div class="flex gap-2">
      <button
        on:click={selectAllLabels}
        class="text-xs text-blue-600 hover:text-blue-700"
        class:font-semibold={allLabelsSelected}
      >
        All
      </button>
      <span class="text-gray-300">|</span>
      <button
        on:click={selectNoLabels}
        class="text-xs text-blue-600 hover:text-blue-700"
        class:font-semibold={noLabelsSelected}
      >
        None
      </button>
    </div>
  </div>
  <p class="text-xs text-gray-500 mb-3">
    {#if allLabelsSelected}
      All custom labels will protect threads from being scanned
    {:else if noLabelsSelected}
      No labels will protect threads (only starred/important)
    {:else}
      Only selected labels will protect threads
    {/if}
  </p>

  {#if !$isAuthenticated}
    <p class="text-xs text-gray-400 italic">
      Authenticate to load your Gmail labels
    </p>
  {:else if isLoadingLabels}
    <div class="flex items-center gap-2 text-xs text-gray-400">
      <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span>Loading labels...</span>
    </div>
  {:else if labelsError}
    <p class="text-xs text-red-500">{labelsError}</p>
  {:else if $availableLabels.length === 0}
    <p class="text-xs text-gray-400 italic">No custom labels found</p>
  {:else}
    <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
      {#each $availableLabels as label}
        <button
          on:click={() => handleLabelToggle(label.id)}
          class="px-3 py-1 text-xs rounded-full border transition-colors"
          class:bg-slate-600={allLabelsSelected || ($protectedLabelIds && $protectedLabelIds.includes(label.id))}
          class:text-white={allLabelsSelected || ($protectedLabelIds && $protectedLabelIds.includes(label.id))}
          class:border-slate-600={allLabelsSelected || ($protectedLabelIds && $protectedLabelIds.includes(label.id))}
          class:bg-white={!allLabelsSelected && (!$protectedLabelIds || !$protectedLabelIds.includes(label.id))}
          class:text-gray-700={!allLabelsSelected && (!$protectedLabelIds || !$protectedLabelIds.includes(label.id))}
          class:border-gray-300={!allLabelsSelected && (!$protectedLabelIds || !$protectedLabelIds.includes(label.id))}
        >
          {label.name}
        </button>
      {/each}
    </div>
  {/if}
</div>
