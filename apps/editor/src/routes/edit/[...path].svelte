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
	import { createDocument, createDocumentStore, createDataBackend } from '@notarium/data';
	import { IDBAdapter } from '@notarium/adapters';
	import * as P2PClient from '@notarium/adapters/P2PClient';
import type { DocumentData } from '@notarium/types';

	export let path:string[];

	const documentBackend = createDataBackend<DocumentData>(path.join('/'), IDBAdapter, P2PClient);

	documentBackend.setDefault('doc');

	const doc = createDocument(documentBackend);

	const docStore = createDocumentStore(documentBackend);

	let text = $docStore.content;
	docStore.subscribe((v) => {
		const storeText = v?.content?.toString();
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

<textarea name="dude" bind:value={text} cols="30" rows="10" />
