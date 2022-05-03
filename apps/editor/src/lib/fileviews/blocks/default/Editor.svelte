<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { GenericParser } from '@notarium/parser';
	import { ChecklistBlock, TableBlock, HeadingBlock, LatexBlock } from './blocks';
	import ParagraphBlock from './blocks/ParagraphBlock.svelte';
	import CodeBlock from './blocks/CodeBlock.svelte';
	import { browser } from '$app/env';
	import { setContext, tick } from 'svelte';
	import type { NotariumBlock } from '@notarium/parser/generic/types';
	import { wait } from '@notarium/common';

	export let text: Writable<string>;

	export let debug = false;

	$: parsed = GenericParser.parse($text);

	$: markdown = GenericParser.render(parsed);

	$: globalThis['window'] && (window['parsed'] = parsed);

	const activeIndex = writable(-1);
	setContext('activeIndex', activeIndex);
	setContext('insertBlock', async (index: number, _blocks: NotariumBlock | NotariumBlock[]) => {
		$activeIndex = -1;
		const blocks = Array.isArray(_blocks) ? _blocks : [_blocks];
		parsed.blocks = [
			...parsed.blocks.slice(0, index + 1),
			...blocks,
			...parsed.blocks.slice(index + 1)
		];
		$activeIndex = index + blocks.length;
	});
	setContext('removeBlock', (index: number) => {
		console.log('remove block', index);
		parsed.blocks = parsed.blocks.filter((_, i) => i !== index);
	});

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
	<div
		class="editor-wrapper"
		class:debug
		style="grid-template-rows: repeat({parsed.blocks.length}, min-content)"
	>
		{#each parsed.blocks as block, index (block)}
			<div
				class="block-wrapper m-y-2 grid grid-cols-[20px_1fr] grid-rows-repeat"
				on:click={() => {
					$activeIndex = index;
				}}
				on:focus={() => {
					$activeIndex = index;
				}}
			>
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

		{#if debug}
			{#each parsed.blocks as block}
				<pre>
				<code>{JSON.stringify(block, null, 2)}</code>
        </pre>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.editor-wrapper {
		display: grid;
		grid-auto-flow: column;
	}

	.block-wrapper:hover > .i-carbon-menu {
		opacity: 1;
	}

	pre {
		position: relative;
	}

	.debug > .block-wrapper {
		outline: solid thin red;
	}

	pre > code {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: scroll;
	}
</style>
