<script>
  import { domains } from '../stores/collectionStore.js';
  import { selectedDomains, selectedCount } from '../stores/cleanupStore.js';
  import { domainsVisible } from '../stores/uiStore.js';
  import DomainItem from './DomainItem.svelte';

  let searchQuery = '';
  let filteredDomains = [];

  function updateFilteredDomains() {
    if (!searchQuery.trim()) {
      filteredDomains = Object.entries($domains);
    } else {
      const query = searchQuery.toLowerCase();

      filteredDomains = Object.entries($domains).filter(([domain, info]) => {
        if (domain.toLowerCase().includes(query)) {
          return true;
        }

        const threads = info.threads || [];
        return threads.some(thread =>
          thread.subject.toLowerCase().includes(query)
        );
      });
    }
  }

  $: {
    $domains;
    searchQuery;
    updateFilteredDomains();
  }

  function selectAll() {
    selectedDomains.update(set => {
      const newSet = new Set(set);
      filteredDomains.forEach(([domain]) => newSet.add(domain));
      return newSet;
    });
  }

  function deselectAll() {
    selectedDomains.update(set => {
      const newSet = new Set(set);
      filteredDomains.forEach(([domain]) => newSet.delete(domain));
      return newSet;
    });
  }

  $: searchResultsText = searchQuery.trim()
    ? `${filteredDomains.length} of ${Object.keys($domains).length} domains`
    : `${Object.keys($domains).length} domains found`;
</script>

{#if $domainsVisible}
  <div class="bg-white rounded-xl shadow-sm border border-sage-200 overflow-hidden">
    <!-- Header -->
    <div class="px-5 pt-5 pb-4">
      <h3 class="text-sm font-semibold text-sage-700 mb-0.5">Review Domains</h3>
      <p class="text-xs text-sage-400">Select domains to delete. Starred, important, and labeled emails are protected.</p>
    </div>

    <!-- Controls -->
    <div class="px-5 pb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div class="w-full sm:w-auto sm:flex-1 sm:max-w-sm">
        <div class="relative">
          <svg class="w-4 h-4 text-sage-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            bind:value={searchQuery}
            type="text"
            placeholder="Search domains and subjects..."
            class="w-full pl-9 pr-3 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent text-sm text-sage-700 placeholder-sage-300"
          >
        </div>
        <div class="text-[11px] text-sage-300 mt-1">{searchResultsText}</div>
      </div>

      <div class="flex gap-2 flex-shrink-0">
        <button
          on:click={selectAll}
          class="text-xs font-medium text-sage-500 hover:text-sage-700 py-1.5 px-3 rounded-md hover:bg-sage-50 transition-colors"
        >
          Select All
        </button>
        <button
          on:click={deselectAll}
          class="text-xs font-medium text-sage-500 hover:text-sage-700 py-1.5 px-3 rounded-md hover:bg-sage-50 transition-colors"
        >
          Deselect All
        </button>
      </div>
    </div>

    <!-- Table Header -->
    <div class="bg-sage-50 border-y border-sage-100 px-5 py-2.5">
      <div class="flex items-center gap-3">
        <div class="w-5"></div>
        <div class="flex-1 text-[10px] font-semibold text-sage-400 uppercase tracking-wider">Domain</div>
        <div class="w-16 text-[10px] font-semibold text-sage-400 uppercase tracking-wider text-right">Threads</div>
        <div class="w-7"></div>
      </div>
    </div>

    <!-- Domain List -->
    <div class="max-h-[60vh] overflow-y-auto">
      {#if filteredDomains.length === 0}
        <div class="p-8 text-center text-sage-300 text-sm">
          {#if searchQuery.trim()}
            No domains match your search.
          {:else}
            No domains found.
          {/if}
        </div>
      {:else}
        {#each filteredDomains as [domain, info], index (domain)}
          <div class:border-t={index > 0} class="border-sage-100">
            <DomainItem {domain} {info} />
          </div>
        {/each}
      {/if}
    </div>

    <!-- Summary Footer -->
    {#if $selectedCount > 0}
      <div class="px-5 py-3 bg-sage-50 border-t border-sage-100">
        <div class="flex items-center justify-between">
          <div class="text-xs font-semibold text-sage-600">
            {$selectedCount} {$selectedCount === 1 ? 'domain' : 'domains'} selected
          </div>
          <div class="text-[11px] text-sage-400">
            Use the buttons above to preview or delete
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
