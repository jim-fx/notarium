<script lang="ts">
	import 'bytemd/dist/index.css';

	import { Editor, Viewer } from 'bytemd';
	import { getCaretPosition, setCaretPosition, wait } from '@notarium/common';
	import { renderMarkdownToHTML, renderParagraph } from '@notarium/parser';
	import parseDocument from '@notarium/parser/generic/parseDocument';
	import type { NotariumBlock, NotariumTextBlock } from '@notarium/parser/generic/types';
	import { getContext, tick } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let block: NotariumTextBlock;

	const activeIndex = getContext<Writable<number>>('activeIndex');
	const insertBlock =
		getContext<(index: number, b: NotariumBlock | NotariumBlock[]) => void>('insertBlock');
	const removeBlock = getContext<(index: number) => void>('removeBlock');
	export let index: number;
	let text: string = block.md;

	let htmlVal: string;
	$: htmlVal && edit && handleTextChange();

	let initial = true;
	async function handleTextChange() {
		if (initial) {
			initial = false;
			return;
		}
		console.log('p.update');

		await tick();

		await wait(100);

		const v = el?.innerText;
		let e = el;
		window['x'] = () => console.log(e) || e;

		console.log({ v, htmlVal });

		if (!v) return;

		const {
			blocks: [currentBlock, ...newBlocks]
		} = parseDocument(v);

		if (!currentBlock) {
			text = '';
			return;
		}

		console.log({ currentBlock, newBlocks });

		if (currentBlock.type !== block.type) {
			// UUhhh ohh, the block type changed
			console.warn('block type changed');
			currentBlock.id = block.id;
			block = currentBlock as unknown as NotariumTextBlock;
		} else {
			/* block.data = v as unknown as string[]; */
			/* el.innerHTML = `<span>${currentBlock.md}</span>`; */
			text = currentBlock.md;
		}

		if (newBlocks?.length) {
			await tick();
			insertBlock(index, newBlocks);
		}
	}

	$: edit = $activeIndex === index;
	$: handleEditChange(edit);
	let el: HTMLDivElement;
	async function handleEditChange(_edit: boolean) {
		if (edit) {
			const caretPosition = getCaretPosition(el);
			console.log(caretPosition);
			/* text = renderParagraph(block)[0]; */
			/* await tick(); */
			/* setCaretPosition(el, caretPosition); */
			el.focus();
		} else {
			if (!text.length) {
				removeBlock(index);
				return;
			} else if (el) {
				/* block.md = el.innerText; */
			}
			el?.blur();
		}
	}

	function handleKeyDown(ev: KeyboardEvent) {
		if (ev.key === 'Enter') {
			document.execCommand('insertLineBreak');
			/* document.execCommand('formatBlock', false, 'p'); */
			ev.preventDefault();
			/* handleTextChange(); */
		}

		if (ev.key === 'Escape') {
			$activeIndex = -1;
		}

		if (ev.key === 'Backspace') {
			//TODO: Check if at beginning of block, if yes, somehow merge block with previous block
		}

		// Need to check if on top or bottom line
		if (ev.key === 'ArrowUp') {
			/* $activeIndex--; */
		}

		if (ev.key === 'ArrowDown') {
			/* $activeIndex++; */
		}
	}

	function handleChange(v) {
		console.log(v);
	}
</script>

{#if edit}
	<Editor value={text} on:change={handleChange} />
{:else}
	<span
		on:focus={() => {
			$activeIndex = index;
		}}
		on:click={() => {
			$activeIndex = index;
		}}
	>
		<Viewer value={text} />
	</span>
{/if}

<style>
	div {
		display: inline;
		/* white-space: pre-wrap; */
		/* white-space: pre; */
		padding: 0;
		margin: 0;
	}
	div > :global(div) {
		display: inline-block;
	}
	div :global(p) {
		white-space: pre;
		margin: 0;
	}
</style>
