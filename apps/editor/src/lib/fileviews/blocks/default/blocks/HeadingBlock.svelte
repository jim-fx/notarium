<script lang="ts">
	import type { NotariumHeadingBlock } from '@notarium/parser/generic/types';

	export let block: NotariumHeadingBlock;

	export let edit = false;
	const id = block.data.text.replace(/\s/g, '-').toLowerCase();
	function handleKeyDown(ev: KeyboardEvent) {
		if (!edit) return;
		if (ev.key === 'Escape') {
			edit = false;
		}
	}
</script>

{#if edit}
	<svelte:element
		this={'h' + block.data.weight}
		on:click={() => (edit = true)}
		class="m-y-0"
		on:keydown={handleKeyDown}
		contenteditable="true"
		bind:textContent={block.data.text}
		{id}>{block.data.text}</svelte:element
	>
{:else}
	<svelte:element
		this={'h' + block.data.weight}
		on:click={() => (edit = true)}
		class="m-y-0"
		on:keydown={handleKeyDown}
		{id}>{block.data.text}</svelte:element
	>
{/if}
