<script lang="ts">
	import { clickOutside } from '$lib/helpers';
	import { renderMarkdownToHTML } from '@notarium/parser';
	import type { NotariumTextBlock } from '@notarium/parser/generic/types';
	import { tick } from 'svelte';

	export let block: NotariumTextBlock;

	export let edit = false;

	let el: HTMLSpanElement;

	async function toggleEdit() {
		edit = true;
		await tick();
		el.focus();
	}
</script>

<p class="block-type-{block.type} m-0 p-0">
	{#if edit}
		<p
			bind:this={el}
			contenteditable
			use:clickOutside
			on:click_outside={() => (edit = false)}
			bind:textContent={block.md}
		/>
	{:else}
		<div on:click={toggleEdit}>
			{@html renderMarkdownToHTML(block.md)}
		</div>
	{/if}
</p>

<style>
	p {
		white-space: pre-wrap;
		padding: 0;
		margin: 0;
	}
	div > :global(p) {
		margin: 0;
	}
</style>
