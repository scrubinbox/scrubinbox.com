import { writable } from 'svelte/store';

export const excludedDomains = writable([]);          // Domains to exclude from scan
export const protectedLabelIds = writable(null);       // Labels to protect: null = all, [] = none, [...] = specific
export const availableLabels = writable([]);           // Labels fetched from Gmail
