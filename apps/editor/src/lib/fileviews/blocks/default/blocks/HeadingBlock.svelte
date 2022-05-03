<script lang="ts">
	import { renderHeading } from '@notarium/parser';
	import type { NotariumBlock, NotariumHeadingBlock } from '@notarium/parser/generic/types';
	import { getContext, tick } from 'svelte';
	import type { Writable } from 'svelte/store';

	import { getCaretPosition, setCaretPosition } from '@notarium/common';
	import parseDocument from '@notarium/parser/generic/parseDocument';

	export let block: NotariumHeadingBlock;

	const activeIndex = getContext<Writable<number>>('activeIndex');
	const insertBlock =
		getContext<(index: number, b: NotariumBlock | NotariumBlock[]) => void>('insertBlock');
	export let index: number;
	let elem: HTMLHeadingElement;

	$: edit = $activeIndex === index;
	$: setEdit(edit);
	async function setEdit(_edit: boolean) {
		if (edit) {
			const caretPosition = getCaretPosition(elem);
			text = renderHeading(block)[0];
			await tick();
			setCaretPosition(elem, caretPosition + block.data.weight + 1);
			elem.focus();
		} else {
			text = block.data.text;
			elem?.blur();
		}
	}

	let text = block.data.text;
	$: text && edit && handleTextUpdate();
	async function handleTextUpdate() {
		const { blocks } = parseDocument(text);

		if (blocks[0].type !== block.type) {
			// UUhhh ohh, the block type changed
			console.warn('block type changed');
			block = blocks[0] as any;
		} else {
			const newData = blocks[0].data;

			block.data.text = newData.text;

			text = renderHeading(blocks[0])[0];

			if (newData.weight !== block.data.weight) {
				const caretPosition = getCaretPosition(elem);
				block.data.weight = newData.weight;
				await tick();
				setCaretPosition(elem, caretPosition);
			}

			block.md = text;
		}

		if (blocks.length > 1) {
			// UUhhh ohh, we have a new block
			insertBlock(index, blocks.slice(1));
		}
	}

	const id = block.data.text.replace(/\s/g, '-').toLowerCase();
	function handleKeyDown(ev: KeyboardEvent) {
		if (!edit) return;
		if (ev.key === 'Escape') {
			$activeIndex = -1;
		}
		if (ev.key === 'ArrowDown') {
			$activeIndex++;
		}

		if (ev.key === 'ArrowUp') {
			$activeIndex--;
		}
	}
</script>

<svelte:element
	this={'h' + block.data.weight}
	class="header m-y-0"
	on:blur={async () => {
		if ($activeIndex === index) {
			$activeIndex = -1;
		}
	}}
	on:focus={() => {
		$activeIndex = index;
	}}
	bind:this={elem}
	on:keydown={handleKeyDown}
	contenteditable
	bind:innerHTML={text}
	{id}>{text}</svelte:element
>

<style>
	.header {
		display: inline-block;
	}
</style>
