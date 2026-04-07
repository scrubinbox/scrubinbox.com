import { writable } from 'svelte/store';

export const excludedDomains = writable([]);          // Domains to exclude from scan
export const excludedLabelIds = writable(null);        // Labels to exclude from scan: null = all, [] = none, [...] = specific
export const availableLabels = writable([]);           // Labels fetched from Gmail
export const excludeStarred = writable(true);          // Exclude starred threads (default: yes)
export const excludeImportant = writable(false);       // Exclude important threads (default: no — Gmail auto-applies)
