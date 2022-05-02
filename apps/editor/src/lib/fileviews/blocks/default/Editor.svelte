<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { GenericParser } from '@notarium/parser';
	import { ChecklistBlock, TableBlock, HeadingBlock, LatexBlock } from './blocks';
	import ParagraphBlock from './blocks/ParagraphBlock.svelte';
	import CodeBlock from './blocks/CodeBlock.svelte';
	import { browser } from '$app/env';
	import { setContext, tick } from 'svelte';
	import type { NotariumBlock } from '@notarium/parser/generic/types';

	export let text: Writable<string>;

	$: parsed = GenericParser.parse($text);

	$: markdown = GenericParser.render(parsed);

	const activeIndex = writable(-1);
	setContext('activeIndex', activeIndex);
	setContext('insertBlock', async (index: number, block: NotariumBlock) => {
		parsed.blocks = [
			...parsed.blocks.slice(0, index + 1),
			block,
			...parsed.blocks.slice(index + 1)
		];
		await tick();
		$activeIndex = index + 1;
	});
	setContext('removeBlock', (index: number) => {
		parsed.blocks = parsed.blocks.filter((_, i) => i !== index);
		console.log('removed', index);
	});

	function update() {
		$text = markdown;
	}

	$: if (markdown) {
		/* console.log('MARK:', markdown); */
		if (markdown !== $text) {
			update();
		}
	}

	$: browser && (window['t'] = parsed);
</script>

{#if parsed}
	{#each parsed.blocks as block, index (block.id)}
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
					<HeadingBlock bind:block {index} />
				{:else if block.type === 'paragraph'}
					<ParagraphBlock bind:block {index} />
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
