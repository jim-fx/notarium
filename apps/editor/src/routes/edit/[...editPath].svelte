<script lang="ts">
	import { createWritableDocumentStore, createLoader } from '@notarium/data';
	import {
		documentBackend,
		activeNode,
		activeNodeId,
		isEditing,
		editorType,
		treeBackend,
		localStore
	} from '$lib/stores';
	import { BlockView } from '$lib/elements';
	import { onMount } from 'svelte';
	import { renderMarkdown, parseDocument } from '@notarium/parser';

	$: text = $documentBackend && createWritableDocumentStore($documentBackend);

	$: parsedDocument = text && parseDocument($text);

	$: blockAvailable = !!parsedDocument?.frontmatter?.type;

	$: preferBlock = localStore.get(activeNodeId + '-prefer-block', false);

	$: $editorType = blockAvailable && $preferBlock ? 'block' : 'text';

	let loader: ReturnType<typeof createLoader>;
	function makeOffline() {
		loader = createLoader(treeBackend);
		loader.load((d) => {
			console.log(d);
		});
	}

	function toggleEditing() {
		$isEditing = !$isEditing;
	}
</script>

{#if !$activeNode}
	<p>404</p>
{:else if $activeNode.mimetype === 'dir'}
	<h3>This is directory:</h3>
	<ul>
		{#each $activeNode.children as n}
			<li>
				<a href="/edit/{$activeNodeId}/{n.path}">{n.path}</a>
			</li>
		{/each}
	</ul>
{:else}
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

		<button on:click={makeOffline}>Make Offline</button>
	</header>

	{#if $editorType === 'text'}
		{#if $isEditing}
			<textarea name="dude" bind:value={$text} cols="30" rows="10" />
		{:else}
			{@html renderMarkdown($text)}
		{/if}
	{:else if $editorType === 'block'}
		{#if blockAvailable}
			<BlockView backend={$documentBackend} isEditing={$isEditing} {parsedDocument} />
		{:else}
			<p>No Block Data avaialbned</p>
		{/if}
	{/if}
{/if}

<style>
	textarea {
		height: 90vh;
		width: 100%;
	}
</style>
