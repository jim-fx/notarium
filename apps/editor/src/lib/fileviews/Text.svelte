<script lang="ts">
	import { getParser } from './blocks';
	import { createWritableDocumentStore } from '@notarium/data';
	import { localStore } from '$lib/stores';
	import { createContextStore } from '@notarium/data';
	import type { File } from '@notarium/fs';

	export let file: File;

	$: text = file && createWritableDocumentStore(file);

	const context = createContextStore(file);

	const editorTypes = ['vim', 'block'];
	let editorType = localStore.get('prefer-editor-type', 'block');
	if (!editorTypes.includes($editorType)) {
		$editorType = editorTypes[0];
	}

	$: parser = getParser($context?.type);
</script>

<header>
	{#each editorTypes as type}
		<button
			class:active={type === $editorType}
			on:click={() => {
				$editorType = type;
			}}>{type}</button
		>
	{/each}
</header>

{#if $editorType === 'vim'}
	{#await import('$lib/elements/TextEditor.svelte')}
		<p>Loading Editor</p>
	{:then comp}
		<svelte:component this={comp.default} {file} />
	{/await}
{:else if $editorType === 'block'}
	<svelte:component this={parser} {text} />
{/if}

<style>
	.active {
		background-color: white;
	}
</style>
