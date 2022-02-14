<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { parse, renderMark } from './parser';
	import { ChecklistBlock, TableBlock, HeadingBlock } from './blocks';
	import ParagraphBlock from './blocks/ParagraphBlock.svelte';

	export let text: Writable<string>;

	export let isEditing = false;

	$: parsed = parse($text);

	$: markdown = renderMark(parsed);

	function update() {
		$text = markdown;
	}

	$: if (markdown) {
		if (markdown !== $text) {
			update();
		}
	}
</script>

{#if parsed}
	{#each parsed.blocks as block}
		{#if !block}
			<p>No Block</p>
		{:else if block.type === 'checklist'}
			<ChecklistBlock bind:block edit={isEditing} />
		{:else if block.type === 'table'}
			<TableBlock bind:block />
		{:else if block.type === 'heading'}
			<HeadingBlock bind:block />
		{:else if block.type === 'paragraph'}
			<ParagraphBlock bind:block edit={isEditing} />
		{:else}
			<p>Block Type: {block.type} not implemented</p>
		{/if}
	{/each}
{/if}
