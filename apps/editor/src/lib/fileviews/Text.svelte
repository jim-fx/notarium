<script lang="ts">
	import type { IDataBackend, IFile } from '@notarium/types';
	import { GenericParser, renderMarkdownToHTML, parseFrontmatter } from '@notarium/parser';
	import { getParser } from './blocks';
	import { createDataBackend, createWritableDocumentStore } from '@notarium/data';
	import { isEditing, localStore } from '$lib/stores';
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

	$: frontMatter = text && parseFrontmatter($text);

	$: blockAvailable = !!frontMatter?.type;

	$: preferBlock = localStore.get(activeNodeId + '-prefer-block', false);

	$: editorType = blockAvailable && $preferBlock ? 'block' : 'text';

	$: parser = blockAvailable && getParser(frontMatter?.type);

	let mdContainer;
	$: if (mdContainer) {
		console.log(mdContainer);
	}

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
		{#if browser}
			{#await import('$lib/elements/TextEditor.svelte')}
				<p>Loading Text</p>
			{:then editorComponent}
				<svelte:component this={editorComponent.default} bind:value={$text} />
			{/await}
		{:else}
			<textarea name="" id="" cols="30" rows="10" />
		{/if}
	{:else}
		<div id="md-container" bind:this={mdContainer}>
			{@html renderMarkdownToHTML($text)}
		</div>
	{/if}
{:else if editorType === 'block'}
	{#if blockAvailable}
		{#if parser}
			<svelte:component this={parser} {text} isEditing={$isEditing} />
		{:else}
			<p>No parser available for {frontMatter?.type}</p>
		{/if}
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
