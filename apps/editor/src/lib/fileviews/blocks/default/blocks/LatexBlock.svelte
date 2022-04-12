<script lang="ts">
	import type { NotariumLatexBlock } from '@notarium/parser/generic/types';

	export let block: NotariumLatexBlock;

	export let edit = false;
</script>

<section>
	{#if edit}
		<code contenteditable="true" bind:textContent={block.md}>{block.md}</code>
	{:else}
		{@html block.html}
	{/if}
</section>
