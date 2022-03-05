import dictionary from './dictionary/Editor.svelte';
import def from './default/Editor.svelte';

export function getParser(type: string) {
	if (!type) return;
	switch (type) {
		case 'dictionary':
			return dictionary;
		default:
			return def;
	}
}
