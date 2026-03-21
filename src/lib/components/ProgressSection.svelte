<script>
  import { progressVisible, progressPercent, progressText, progressIndeterminate, errorMessage } from '../stores/progressStore.js';
</script>

{#if $progressVisible}
  <div class="bg-white rounded-xl shadow-sm p-5 border border-sage-200">
    <h3 class="text-sm font-semibold text-sage-700 mb-3">Progress</h3>

    <div class="bg-sage-100 rounded-full h-1.5 mb-2">
      <div
        class="h-1.5 rounded-full transition-all duration-300 bg-sage-500"
        class:indeterminate={$progressIndeterminate}
        style="width: {$progressPercent}%"
      ></div>
    </div>

    <div class="text-xs text-sage-400">{$progressText}</div>

    {#if $errorMessage}
      <div class="mt-3 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
        {$errorMessage}
      </div>
    {/if}
  </div>
{/if}
