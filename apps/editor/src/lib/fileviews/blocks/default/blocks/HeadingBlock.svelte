<script lang="ts">
	import type { NotariumHeadingBlock } from '@notarium/parser/generic/types';

	export let block: NotariumHeadingBlock;

	export let edit = false;
	const id = block.html.split(' ').join('-');
</script>

{#if block.data.weight === 1}
	<h1 contenteditable={edit} {id}>{block.data.text}</h1>
{:else if block.data.weight === 2}
	<h2 contenteditable={edit} {id}>{block.data.text}</h2>
{:else if block.data.weight === 3}
	<h3 contenteditable={edit} {id}>{block.data.text}</h3>
{:else if block.data.weight === 4}
	<h4 contenteditable={edit} {id}>{block.data.text}</h4>
{:else if block.data.weight === 5}
	<h5 contenteditable={edit} {id}>{block.data.text}</h5>
{/if}
