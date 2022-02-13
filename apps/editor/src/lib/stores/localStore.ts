import { browser } from '$app/env';
import { writable, Writable } from 'svelte/store';
import { createCachedFactory } from '@notarium/common';

let globalStore = {};

if (browser && 'nota-settings' in localStorage) {
	try {
		globalStore = JSON.parse(localStorage.getItem('nota-settings'));
	} catch (err) {
		console.log('[settings] failed to parse localSettings');
		localStorage.removeItem('nota-settings');
	}
}

export const get = createCachedFactory(_get, (key) => key);
function _get<T>(key: string, def: T): Writable<T> {
	let _def = def;
	if (key in globalStore) {
		_def = globalStore[key];
	}

	const store = writable(_def);

	store.subscribe((v) => {
		globalStore[key] = v;
		if (browser) {
			localStorage.setItem('nota-settings', JSON.stringify(globalStore));
		}
	});

	return store;
}

export function set(key: string, v: unknown) {
	get(key, v).set(v);
}
