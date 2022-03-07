<script lang="ts">
	import type { IFile } from '@notarium/types';
	import { GenericParser, renderMarkdownToHTML, parseFrontmatter } from '@notarium/parser';
	import { getParser } from './blocks';
	import { createWritableDocumentStore } from '@notarium/data';
	import { isEditing, localStore } from '$lib/stores';
	import { browser } from '$app/env';
	import fs from '$lib/fs';
	import type { File } from '@notarium/fs';

	export let activeNode: IFile;
	export let activeNodeId: string;

	let activeFile: File;
	function loadFile(path: string) {
		/* if (activeFile && activeFile.path === path) return; */
		/* if (activeFile) activeFile.close(); */
		const file = fs.openFile(path);
		file.load().then(() => {
			if (activeNodeId === path) {
				activeFile = file;
			}
		});
	}

	$: activeNode && loadFile(activeNodeId);

	$: text = activeFile && createWritableDocumentStore(activeFile);

	$: frontMatter = text && parseFrontmatter($text);

	$: blockAvailable = !!frontMatter?.type;

	$: preferBlock = localStore.get(activeNodeId + '-prefer-block', false);

	$: editorType = blockAvailable && $preferBlock ? 'block' : 'text';

	$: parser = blockAvailable && getParser(frontMatter?.type);

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

{#if activeFile}
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
			<div id="md-container">
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
{:else}
	<p>Loadin</p>
{/if}

<style>
	textarea {
		height: 90vh;
		width: 100%;
	}
</style>
