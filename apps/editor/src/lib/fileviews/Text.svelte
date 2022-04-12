<script lang="ts">
	import { renderMarkdownToHTML, parseFrontmatter } from '@notarium/parser';
	import { getParser } from './blocks';
	import { createWritableDocumentStore } from '@notarium/data';
	import { isEditing, localStore } from '$lib/stores';
	import { browser } from '$app/env';
	import type { File } from '@notarium/fs';

	export let file: File;

	$: text = file && createWritableDocumentStore(file);

	$: frontMatter = text && parseFrontmatter($text);

	$: blockAvailable = !!frontMatter?.type;

	let preferBlockStore = localStore.get(file.path + '-prefer-block', false);
	let preferBlock = $preferBlockStore;

	$: editorType = blockAvailable && preferBlock ? 'block' : 'text';

	$: parser = blockAvailable && getParser(frontMatter?.type);

	function toggleEditing() {
		$isEditing = !$isEditing;
	}
</script>

<header>
	{#if blockAvailable}
		{#if preferBlock}
			<button
				on:click={() => {
					preferBlock = false;
				}}>text</button
			>
		{:else}
			<button
				on:click={() => {
					preferBlock = true;
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
	{#if $isEditing && browser}
		{#await import('$lib/elements/TextEditor.svelte')}
			<p>Loading Editor</p>
		{:then comp}
			<svelte:component this={comp.default} {file} />
		{/await}
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
