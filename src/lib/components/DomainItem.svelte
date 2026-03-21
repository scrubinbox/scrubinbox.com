<script>
  import { selectedDomains, expandedDomains } from '../stores/cleanupStore.js';

  export let domain;
  export let info;

  let isSelected = false;
  let isExpanded = false;

  $: isSelected = $selectedDomains.has(domain);
  $: isExpanded = $expandedDomains.has(domain);

  function toggleSelection() {
    selectedDomains.update(set => {
      const newSet = new Set(set);
      if (newSet.has(domain)) {
        newSet.delete(domain);
      } else {
        newSet.add(domain);
      }
      return newSet;
    });
  }

  function toggleExpand() {
    expandedDomains.update(set => {
      const newSet = new Set(set);
      if (newSet.has(domain)) {
        newSet.delete(domain);
      } else {
        newSet.add(domain);
      }
      return newSet;
    });
  }
</script>

<div class="transition-colors" class:bg-sage-50={isSelected} class:hover:bg-sage-50={!isSelected}>
  <div class="px-5 py-2.5">
    <div class="flex items-center gap-3">
      <div class="w-5 flex-shrink-0">
        <input
          type="checkbox"
          class="h-4 w-4 text-sage-600 border-sage-300 rounded cursor-pointer focus:ring-2 focus:ring-sage-300"
          checked={isSelected}
          on:change={toggleSelection}
        >
      </div>

      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-sage-800 truncate">{domain}</div>
      </div>

      <div class="w-16 flex-shrink-0 text-right">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sage-100 text-sage-600">
          {info.count}
        </span>
      </div>

      <div class="w-7 flex-shrink-0 flex justify-center">
        <button
          on:click={toggleExpand}
          class="text-sage-300 hover:text-sage-500 transition-colors p-1 rounded hover:bg-sage-100"
          class:text-sage-500={isExpanded}
          aria-label="Toggle threads"
        >
          <svg class="w-3.5 h-3.5 transform transition-transform duration-200" class:rotate-180={isExpanded} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
    </div>

    {#if isExpanded}
      <div class="mt-2 ml-8 pl-3 border-l-2 border-sage-200 animate-slideDown">
        <div class="text-[10px] font-semibold text-sage-400 uppercase tracking-wider mb-1.5">
          Threads ({info.threads?.length || 0})
        </div>
        {#if !info.threads || info.threads.length === 0}
          <div class="text-xs text-sage-300 italic">No threads available</div>
        {:else}
          <div class="space-y-1 max-h-60 overflow-y-auto">
            {#each info.threads as thread}
              <div class="text-xs bg-sage-50 rounded-md p-2 border border-sage-100">
                <div class="font-medium text-sage-700 break-words" title={thread.subject}>
                  {thread.subject}
                </div>
                <div class="text-sage-400 mt-0.5">
                  {thread.sender} ({thread.message_count} {thread.message_count === 1 ? 'msg' : 'msgs'})
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 500px;
    }
  }

  .animate-slideDown {
    animation: slideDown 0.2s ease-out;
  }
</style>
