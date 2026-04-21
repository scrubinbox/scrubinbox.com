<script>
  import { resultsVisible, resultsData } from '../stores/resultsStore.js';

  let groupedThreads = {};
  let sortedDomains = [];
  let expandedDomains = new Set();

  $: actionVerb = $resultsData?.permanent_delete ? 'Deleted' : 'Trashed';

  $: if ($resultsData?.deleted_threads) {
    const grouped = {};
    for (const thread of $resultsData.deleted_threads) {
      if (!grouped[thread.domain]) {
        grouped[thread.domain] = [];
      }
      grouped[thread.domain].push(thread);
    }
    groupedThreads = grouped;
    sortedDomains = Object.keys(grouped).sort((a, b) =>
      grouped[b].length - grouped[a].length
    );
    expandedDomains = new Set();
  }

  function toggleDomain(domain) {
    if (expandedDomains.has(domain)) {
      expandedDomains.delete(domain);
    } else {
      expandedDomains.add(domain);
    }
    expandedDomains = expandedDomains;
  }
</script>

{#if $resultsVisible && $resultsData}
  <div class="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-sage-200">
    <h3 class="text-sm font-semibold text-sage-700 mb-4">Cleanup Results</h3>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-sage-50 p-4 rounded-lg border border-sage-100">
        <div class="text-2xl font-bold text-sage-800">{$resultsData.threads_processed}</div>
        <div class="text-xs text-sage-400 mt-1 font-medium">Threads Processed</div>
      </div>
      <div class="bg-red-50 p-4 rounded-lg border border-red-100">
        <div class="text-2xl font-bold text-red-600">{$resultsData.threads_deleted}</div>
        <div class="text-xs text-red-400 mt-1 font-medium">Threads {actionVerb}</div>
      </div>
      <div class="bg-amber-50 p-4 rounded-lg border border-amber-100">
        <div class="text-2xl font-bold text-amber-600">{$resultsData.threads_failed_to_delete}</div>
        <div class="text-xs text-amber-400 mt-1 font-medium">Failed to {$resultsData?.permanent_delete ? 'Delete' : 'Trash'}</div>
      </div>
    </div>

    {#if sortedDomains.length > 0}
      <div class="mt-5 border-t border-sage-100 pt-4">
        <h4 class="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-3">{actionVerb} Threads by Sender Domain</h4>
        <div class="max-h-[60vh] overflow-y-auto space-y-1">
          {#each sortedDomains as domain}
            <div class="border border-sage-100 rounded-lg overflow-hidden">
              <button
                on:click={() => toggleDomain(domain)}
                class="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 text-left hover:bg-sage-50 transition-colors"
              >
                <svg
                  class="w-3.5 h-3.5 text-sage-300 flex-shrink-0 transform transition-transform duration-200"
                  class:rotate-90={expandedDomains.has(domain)}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span class="text-sm font-medium text-sage-700 flex-1 min-w-0 truncate">{domain}</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-500 flex-shrink-0">
                  {groupedThreads[domain].length}
                </span>
              </button>

              {#if expandedDomains.has(domain)}
                <div class="border-t border-sage-100 bg-sage-50/50 px-3 sm:px-4 py-2 space-y-1.5">
                  {#each groupedThreads[domain] as thread}
                    <div class="text-xs bg-white rounded-md p-2 border border-sage-100">
                      <div class="font-medium text-sage-700 break-words">{thread.subject}</div>
                      <div class="text-sage-400 mt-0.5">
                        {thread.sender} ({thread.message_count} {thread.message_count === 1 ? 'msg' : 'msgs'})
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
