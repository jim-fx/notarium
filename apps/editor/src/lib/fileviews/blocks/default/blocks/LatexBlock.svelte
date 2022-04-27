<script lang="ts">
	import type { NotariumLatexBlock } from '@notarium/parser/generic/types';
	import { clickOutside } from '$lib/helpers';
	import { parseLatex } from '@notarium/parser';

	export let block: NotariumLatexBlock;

	$: if (block?.md) {
		block.data = block.md.split('\n');
	}

	export let edit = false;

	function handleKeyDown(ev: KeyboardEvent) {
		if (!edit) return;
		if (ev.key === 'Escape') {
			edit = false;
		}
	}
</script>

<section on:click={() => (edit = true)} use:clickOutside on:click_outside={() => (edit = false)}>
	{#if edit}
		<div>
			<code on:keydown={handleKeyDown} contenteditable bind:textContent={block.md} />
		</div>
	{/if}
	{@html parseLatex(block.md.split('\n'))}
</section>

<style>
	code {
		font-size: 1.4em;
	}
</style>
