import { writable } from 'svelte/store';

export const progressVisible = writable(false);
export const progressPercent = writable(0);
export const progressText = writable('Waiting...');
export const progressIndeterminate = writable(false);
export const errorMessage = writable('');
export const progressDeletedThreads = writable([]);
