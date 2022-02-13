import type { SvelteComponentTyped } from 'svelte';
import type { Writable } from 'svelte/store';

export interface Parser {
	Editor: SvelteComponentTyped<{ text: Writable<string>; isEditing: true }>;
	Viewer: SvelteComponentTyped<{ text: Writable<string>; isEditing: false }>;
}
