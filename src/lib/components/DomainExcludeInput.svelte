<script>
  import { excludedDomains } from '../stores/filterStore.js';

  function handleDomainInputChange(event) {
    const value = event.target.value;
    const domains = value
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(d => d.length > 0);
    excludedDomains.set(domains);
  }

  function removeDomain(domain) {
    excludedDomains.update(domains => domains.filter(d => d !== domain));
  }
</script>

<div>
  <label for="excluded-domains" class="block text-sm font-medium text-sage-700 mb-1.5">
    Exclude Sender Domains from Scan
  </label>
  <p class="text-xs text-sage-400 mb-2">
    Threads from these sender domains will not appear in scan results
  </p>
  <input
    id="excluded-domains"
    type="text"
    value={$excludedDomains.join(', ')}
    on:input={handleDomainInputChange}
    placeholder="example.com, newsletter.com"
    class="w-full px-3 py-2 border border-sage-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent text-sage-700 placeholder-sage-300"
  />
  {#if $excludedDomains.length > 0}
    <div class="flex flex-wrap gap-1.5 mt-2">
      {#each $excludedDomains as domain}
        <span class="inline-flex items-center gap-1 px-2 py-1 bg-sage-100 text-sage-600 text-xs rounded-md font-medium">
          {domain}
          <button
            on:click={() => removeDomain(domain)}
            class="text-sage-400 hover:text-sage-600"
            aria-label="Remove {domain}"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      {/each}
    </div>
  {/if}
</div>
