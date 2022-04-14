<script lang="ts">
	import type { NotariumLatexBlock } from '@notarium/parser/generic/types';
	import { clickOutside } from '$lib/helpers';

	export let block: NotariumLatexBlock;

	export let edit = false;
</script>

<section on:click={() => (edit = true)} use:clickOutside on:click_outside={() => (edit = false)}>
	{#if edit}
		<code contenteditable="true" bind:textContent={block.md}>{block.md}</code>
	{:else}
		{@html block.html}
	{/if}
</section>
