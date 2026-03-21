<script>
  import Header from './lib/components/Header.svelte';
  import AuthSection from './lib/components/AuthSection.svelte';
  import FilterOptions from './lib/components/FilterOptions.svelte';
  import ScanControls from './lib/components/ScanControls.svelte';
  import ProgressSection from './lib/components/ProgressSection.svelte';
  import DomainSection from './lib/components/DomainSection.svelte';
  import ResultsSection from './lib/components/ResultsSection.svelte';
</script>

<div class="min-h-screen bg-sage-50">
  <Header />
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <div class="space-y-4">
      <AuthSection />
      <FilterOptions />
      <ScanControls />
      <ProgressSection />
      <DomainSection />
      <ResultsSection />
    </div>
  </div>
</div>
