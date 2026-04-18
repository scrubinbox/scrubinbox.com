<script>
  import { resultsVisible, resultsData } from '../stores/resultsStore.js';
</script>

{#if $resultsVisible && $resultsData}
  <div class="bg-white rounded-xl shadow-sm p-5 border border-sage-200">
    <h3 class="text-sm font-semibold text-sage-700 mb-4">Cleanup Results</h3>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-sage-50 p-4 rounded-lg border border-sage-100">
        <div class="text-2xl font-bold text-sage-800">{$resultsData.threads_processed}</div>
        <div class="text-xs text-sage-400 mt-1 font-medium">Threads Processed</div>
      </div>
      <div class="bg-red-50 p-4 rounded-lg border border-red-100">
        <div class="text-2xl font-bold text-red-600">{$resultsData.threads_deleted}</div>
        <div class="text-xs text-red-400 mt-1 font-medium">Threads Deleted</div>
      </div>
      <div class="bg-amber-50 p-4 rounded-lg border border-amber-100">
        <div class="text-2xl font-bold text-amber-600">{$resultsData.threads_failed_to_delete}</div>
        <div class="text-xs text-amber-400 mt-1 font-medium">Failed to Delete</div>
      </div>
    </div>
  </div>
{/if}
