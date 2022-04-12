<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { GenericParser } from '@notarium/parser';
	import { ChecklistBlock, TableBlock, HeadingBlock, LatexBlock } from './blocks';
	import ParagraphBlock from './blocks/ParagraphBlock.svelte';
	import CodeBlock from './blocks/CodeBlock.svelte';

	export let text: Writable<string>;

	export let isEditing = false;

	$: parsed = GenericParser.parse($text);

	$: markdown = GenericParser.render(parsed);

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
			<HeadingBlock bind:block edit={isEditing} />
		{:else if block.type === 'paragraph'}
			<ParagraphBlock bind:block edit={isEditing} />
		{:else if block.type === 'code'}
			<CodeBlock bind:block />
		{:else if block.type === 'latex'}
			<LatexBlock bind:block edit={isEditing} />
		{:else}
			<p>Block Type: {block.type} not implemented</p>
		{/if}
	{/each}
{/if}
