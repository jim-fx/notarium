<script lang="ts">
	import type { NotariumChecklistBlock } from '@notarium/parser/generic/types';

	import { getContext, tick } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { scale } from 'svelte/transition';

	export let block: NotariumChecklistBlock;

	const activeIndex = getContext<Writable<number>>('activeIndex');
	export let index: number;

	$: edit = $activeIndex === index;

	const defaultItem = { checked: false, text: 'List Item' };

	function handleNew() {
		block.data = [...block.data, { ...defaultItem }];
	}

	function cursor_position() {
		const sel = document.getSelection();
		const pos = sel.toString().length;
		if (sel.anchorNode != undefined) sel.collapseToEnd();
		return pos;
	}

	async function handleKeyDown(ev: KeyboardEvent, i: number) {
		const content = ev.target.textContent;

		if (ev.key === 'Escape') {
			ev.target.blur();
		}

		if (ev.key === 'Enter') {
			const cPos = cursor_position();
			ev.preventDefault();
			ev.target.blur();

			let newItem = { ...defaultItem };

			if (cPos !== content.length) {
				const oldText = content.slice(0, cPos);
				const newText = content.slice(cPos, content.length);
				if (oldText.trim().length) block.data[i].text = oldText;
				if (newText.trim().length) newItem.text = newText;
			}
			block.data.splice(i + 1, 0, newItem);
			block.data = block.data;
			let _i = i;
			await tick();
		}
	}

	function handleRemove(i: number) {
		block.data = block.data.filter((_: any, _i: number) => i !== _i);
	}

	$: done = block.data.filter((v) => v.checked).length;
	$: percent = Math.floor((done / block.data.length) * 100);
</script>

{#if block.data.length > 5}
	<i class="opacity-50 text-xs">{percent}% ({done}/{block.data.length})</i>
{/if}

{#each block.data as item, i}
	<div class="flex items-center" on:click={() => (edit = true)}>
		{#if edit}
			<button transition:scale class="mr-2 text-xs" on:click={() => handleRemove(i)}>✕</button>
		{/if}

		<input type="checkbox" class="text-blue-light" bind:checked={item.checked} />

		{#if edit}
			<p
				contenteditable
				class=""
				bind:textContent={item.text}
				on:keydown={(ev) => handleKeyDown(ev, i)}
			>
				{item.text}
			</p>
		{:else}
			<p class="m-y-2 m-l-2">
				{item.text}
			</p>
		{/if}
	</div>
{/each}

{#if edit}
	<button transition:scale class="elevated" on:click={handleNew}>Add</button>
{/if}

<style>
	input {
		border-radius: 4px;
	}
	p {
		display: inline;
		margin: 0;
	}
</style>
