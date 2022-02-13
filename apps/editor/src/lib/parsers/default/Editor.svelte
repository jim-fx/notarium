<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { parse, renderMark } from './parser';
	import { ChecklistBlock, TableBlock, HeadingBlock } from './blocks';

	export let text: Writable<string>;

	export let isEditing = false;

	$: parsed = parse($text);

	$: markdown = renderMark(parsed);

	function update() {
		$text = markdown;
	}

	$: if (markdown) {
		if (markdown !== $text) {
			update();
		}
	}
</script>

<pre>

{JSON.stringify(parsed?.blocks, null, 2)}
</pre>

{#if parsed}
	{#each parsed.blocks as block}
		{#if !block}
			<p>No Block</p>
		{:else if block.type === 'checklist'}
			<ChecklistBlock bind:block edit={isEditing} />
		{:else if block.type === 'table'}
			<TableBlock bind:block />
		{:else if block.type === 'heading'}
			<HeadingBlock bind:block />
		{:else}
			<p>Block Type: {block.type} not implemented</p>
		{/if}
	{/each}
{/if}
