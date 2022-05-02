<script lang="ts">
	import { getCaretPosition, setCaretPosition, wait } from '@notarium/common';

	import { renderMarkdownToHTML, renderParagraph } from '@notarium/parser';
	import parseDocument from '@notarium/parser/generic/parseDocument';
	import type { NotariumBlock, NotariumTextBlock } from '@notarium/parser/generic/types';
	import { getContext, tick } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let block: NotariumTextBlock;

	const activeIndex = getContext<Writable<number>>('activeIndex');
	const insertBlock = getContext<(index: number, b: NotariumBlock) => void>('insertBlock');
	const removeBlock = getContext<(index: number) => void>('removeBlock');
	export let index: number;
	let md: string = block.md;

	let htmlVal: string;
	$: handleTextChange(htmlVal);

	async function handleTextChange(v: string) {
		if (!v) return;
		if (v.includes('<br>')) {
			v = v.replace(/<br>/g, '\n');
		}

		console.log({ v });

		const {
			blocks: [currentBlock, newBlock]
		} = parseDocument(v);

		if (!currentBlock) {
			md = '';
			return;
		}

		console.log({ currentBlock, newBlock });

		if (currentBlock.type !== block.type) {
			// UUhhh ohh, the block type changed
			console.warn('block type changed');
			currentBlock.id = block.id;
			block = currentBlock as unknown as NotariumTextBlock;
		} else {
			await tick();
			block.data = currentBlock.data;
			md = currentBlock.md;
			/* blocks[0].id = block.id; */
			/* block = blocks[0]; */
			/* md = blocks[0].md; */
			/* block.data = blocks[0].data; */
			/* block.md = newData */
			/* console.log({ newData }); */
		}

		if (newBlock) {
			// UUhhh ohh, we have a new block
			insertBlock(index, newBlock);
			await tick();
		}
	}

	$: edit = $activeIndex === index;
	$: handleEditChange(edit);
	let el: HTMLDivElement;
	async function handleEditChange(_edit: boolean) {
		if (edit) {
			const caretPosition = getCaretPosition(el);
			/* md = renderParagraph(block)[0]; */
			await tick();
			setCaretPosition(el, caretPosition);
			el.focus();
		} else {
			if (!md.length) {
				removeBlock(index);
				return;
			}
			el?.blur();
		}
	}

	function handleKeyDown(ev: KeyboardEvent) {
		if (ev.key === 'Enter') {
			console.log('Eyyy');
			document.execCommand('insertLineBreak');
			document.execCommand('formatBlock', false, 'p');
			ev.preventDefault();
		}

		// Need to check if on top or bottom line
		if (ev.key === 'ArrowUp') {
			/* $activeIndex--; */
		}

		if (ev.key === 'ArrowDown') {
			/* $activeIndex++; */
		}
	}
</script>

<code>
	{JSON.stringify(block)}
</code>
<br />

<div
	on:blur={async () => {
		await tick();
		if ($activeIndex === index) {
			$activeIndex = -1;
		}
	}}
	on:focus={() => {
		$activeIndex = index;
	}}
	on:click={() => {
		$activeIndex = index;
	}}
	on:keydown={handleKeyDown}
	bind:this={el}
	contenteditable
	bind:textContent={htmlVal}
>
	{#if edit}
		{md}
	{:else}
		{@html renderMarkdownToHTML(md)}
	{/if}
</div>

<style>
	div {
		display: inline-block;
		/* white-space: pre-wrap; */
		padding: 0;
		margin: 0;
	}
	div > :global(div) {
		display: inline-block;
	}
	div :global(p) {
		margin: 0;
	}
</style>
