import { writable } from 'svelte/store';

export const excludedDomains = writable([]);          // Domains to exclude from scan
export const useLabelProtection = writable(true);     // Whether custom labels protect threads
export const protectedLabelIds = writable([]);         // Specific labels to protect (empty = none)
export const availableLabels = writable([]);           // Labels fetched from Gmail
