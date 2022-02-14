<script lang="ts">
	import type { IDataBackend, IFile } from '@notarium/types';
	import { renderMarkdown, parseDocument } from '@notarium/parser';
	import { createDataBackend, createWritableDocumentStore } from '@notarium/data';
	import { isEditing, localStore } from '$lib/stores';
	import { BlockView } from '$lib/elements';
	import { IDBAdapter, P2PClient } from '@notarium/adapters';
	import { browser } from '$app/env';

	export let activeNode: IFile;
	export let activeNodeId: string;

	let _docBackend: IDataBackend;
	function setBackend(id: string) {
		if (_docBackend && _docBackend.docId === id) return _docBackend;
		if (_docBackend) _docBackend.close();

		if (browser) {
			_docBackend = createDataBackend(id, {
				persistanceAdapterFactory: IDBAdapter,
				messageAdapter: P2PClient
			});
			_docBackend.load();
			return _docBackend;
		}
	}

	$: documentBackend = activeNode && setBackend(activeNodeId);

	$: text = documentBackend && createWritableDocumentStore(documentBackend);

	$: parsedDocument = text && parseDocument($text);

	$: blockAvailable = !!parsedDocument?.frontmatter?.type;

	$: preferBlock = localStore.get(activeNodeId + '-prefer-block', false);

	$: editorType = blockAvailable && $preferBlock ? 'block' : 'text';

	function toggleEditing() {
		$isEditing = !$isEditing;
	}
</script>

<header>
	{#if blockAvailable}
		{#if $preferBlock}
			<button
				on:click={() => {
					$preferBlock = false;
				}}>text</button
			>
		{:else}
			<button
				on:click={() => {
					$preferBlock = true;
				}}>block</button
			>
		{/if}
	{/if}

	{#if $isEditing}
		<button on:click={toggleEditing}>exit edit</button>
	{:else}
		<button on:click={toggleEditing}>edit</button>
	{/if}
</header>

{#if editorType === 'text'}
	{#if $isEditing}
		<textarea name="dude" bind:value={$text} cols="30" rows="10" />
	{:else}
		{@html renderMarkdown($text)}
	{/if}
{:else if editorType === 'block'}
	{#if blockAvailable}
		<BlockView backend={documentBackend} isEditing={$isEditing} {parsedDocument} />
	{:else}
		<p>No Block Data avaialbned</p>
	{/if}
{/if}

<style>
	textarea {
		height: 90vh;
		width: 100%;
	}
</style>
