<script>
  import { progressVisible, progressPercent, progressText, progressIndeterminate, logs } from '../stores/progressStore.js';
  import { onMount, afterUpdate } from 'svelte';

  let logBoxElement;

  afterUpdate(() => {
    if (logBoxElement) {
      logBoxElement.scrollTop = logBoxElement.scrollHeight;
    }
  });

  function getLogColor(type) {
    const colors = {
      info: 'text-sage-500',
      success: 'text-sage-600',
      warning: 'text-amber-600',
      error: 'text-red-500'
    };
    return colors[type] || 'text-sage-400';
  }
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

    <div class="text-xs text-sage-400 mb-3">{$progressText}</div>

    <div class="border border-sage-100 rounded-lg overflow-hidden">
      <div class="bg-sage-50 px-3 py-2 border-b border-sage-100">
        <h4 class="text-[10px] font-semibold text-sage-400 uppercase tracking-wider">Activity Log</h4>
      </div>
      <div bind:this={logBoxElement} class="bg-white p-3 h-40 overflow-y-auto">
        <div class="space-y-1">
          {#if $logs.length === 0}
            <div class="text-xs text-sage-300">Log messages will appear here...</div>
          {:else}
            {#each $logs as log}
              <div class="text-xs {getLogColor(log.type)} font-mono">
                <span class="text-sage-300">[{log.timestamp}]</span> {log.message}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
