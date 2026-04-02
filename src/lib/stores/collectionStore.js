import { writable, derived } from 'svelte/store';

export const isCollecting = writable(false);
export const domains = writable({});
export const collectionResult = writable(null);  // CollectionResult instance from last scan

export const hasCollectedDomains = derived(domains, $domains => Object.keys($domains).length > 0);
