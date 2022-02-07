<script context="module" lang="ts">
	export function load({ params }) {
		return {
			props: {
				path: params?.path?.split('/').filter((v) => v.length)
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';

	import { createDocument, createDocumentStore, createDataBackend } from '@notarium/data';
	import { IDBAdapter } from '@notarium/adapters';
	import * as P2PClient from '@notarium/adapters/P2PClient';

	export let path: string[];
	let state = 'view';

	const documentBackend = createDataBackend<string>(path.join('/'), {
		persistanceAdapterFactory: IDBAdapter,
		messageAdapter: P2PClient
	});

	const doc = createDocument(documentBackend);

	const docStore = createDocumentStore(documentBackend);

	let text = $docStore;
	docStore.subscribe((storeText) => {
		if (storeText !== text) {
			text = storeText;
		}
	});

	$: if (text && text.length) {
		doc.setText(text);
	}

	let inputText;
	function handleKeyDown(ev) {
		if (ev.key === 'Enter') {
			inputText = '';
		}
	}

	onMount(() => {
		documentBackend.load();
		return documentBackend.close;
	});
</script>

<header>
	<button
		on:click={() => {
			state = 'edit';
		}}>edit</button
	>
	<button
		on:click={() => {
			state = 'view';
		}}>view</button
	>
</header>

{#if state === 'view'}
	<SvelteMarkdown source={text} />
{:else}
	<textarea name="dude" bind:value={text} cols="30" rows="10" />
{/if}

<style>
	textarea {
		height: 90vh;
		width: 100%;
	}
</style>
