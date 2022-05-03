<script lang="ts">
	import 'bytemd/dist/index.css';

	import { Editor, Viewer } from 'bytemd';
	import parseDocument from '@notarium/parser/generic/parseDocument';
	import type { NotariumBlock, NotariumParagraphBlock } from '@notarium/parser/generic/types';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let block: NotariumParagraphBlock;

	const activeIndex = getContext<Writable<number>>('activeIndex');
	const insertBlock =
		getContext<(index: number, b: NotariumBlock | NotariumBlock[]) => void>('insertBlock');
	const removeBlock = getContext<(index: number) => void>('removeBlock');
	export let index: number;
	let text: string = block.md;

	$: edit = $activeIndex === index;

	$: if (edit) {
	} else {
		if (!text) {
			removeBlock(index);
		}
	}

	async function handleChange(v) {
		if (!v?.detail?.value) {
			text = '';
			return;
		}

		const {
			blocks: [b, ...newBlocks]
		} = parseDocument(v.detail.value);

		block.md = v.detail.value;
		block.data = block.md;

		if (newBlocks?.length) {
			text = b.md;
			insertBlock(index, newBlocks);
		}
	}
</script>

{#if edit}
	<Editor mode="tab" value={text} on:change={handleChange} />
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
	:global(.bytemd) {
		border: none;
		height: min-content;
	}
	:global(.bytemd-status, .bytemd-toolbar) {
		display: none;
	}

	:global(.CodeMirror-lines, .CodeMirror-line) {
		padding: 0px !important;
	}
</style>
