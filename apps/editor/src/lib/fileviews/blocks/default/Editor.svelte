<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { GenericParser } from '@notarium/parser';
	import { ChecklistBlock, TableBlock, HeadingBlock, LatexBlock } from './blocks';
	import ParagraphBlock from './blocks/ParagraphBlock.svelte';
	import CodeBlock from './blocks/CodeBlock.svelte';
	import { browser } from '$app/env';

	export let text: Writable<string>;

	$: parsed = GenericParser.parse($text);

	$: markdown = GenericParser.render(parsed);

	function update() {
		$text = markdown;
	}

	$: if (markdown) {
		console.log('MARK:', markdown);
		if (markdown !== $text) {
			update();
		}
	}

	$: browser && (window['t'] = parsed);
</script>

{#if parsed}
	{#each parsed.blocks as block}
		<div class="block-wrapper m-y-4 grid grid-cols-[20px_1fr] grid-rows-repeat">
			<div class="m-t-1 i-carbon-menu opacity-0" />
			<div>
				{#if !block}
					<p>No Block</p>
				{:else if block.type === 'checklist'}
					<ChecklistBlock bind:block />
				{:else if block.type === 'table'}
					<TableBlock bind:block />
				{:else if block.type === 'heading'}
					<HeadingBlock bind:block />
				{:else if block.type === 'paragraph'}
					<ParagraphBlock bind:block />
				{:else if block.type === 'code'}
					<CodeBlock bind:block />
				{:else if block.type === 'latex'}
					<LatexBlock bind:block />
				{:else}
					<p>Block Type: {block.type} not implemented</p>
				{/if}
			</div>
		</div>
	{/each}
{/if}

<style>
	.block-wrapper:hover > .i-carbon-menu {
		opacity: 1;
	}
</style>
