<script lang="ts">
	import { onMount } from 'svelte';

	export let block;

	export let edit = false;

	function handleInput(ev) {
		block.md = ev.target.textContent;
	}

	let el: HTMLSpanElement;

	onMount(() => {
		if (!el) return;
		/* const range = document.createRange(); //Create a range (a range is a like the selection but invisible) */
		/* range.selectNodeContents(el); //Select the entire contents of the element with the range */
		/* range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start */
		/* const selection = window.getSelection(); //get the selection object (allows you to change selection) */
		/* selection.removeAllRanges(); //remove any selections already made */
		/* selection.addRange(range); //make the range you have just created the visible selection */
	});
</script>

<p class="block-type-{block.type}">
	{#if edit}
		<span bind:this={el} contenteditable on:input={handleInput} bind:textContent={block.md} />
	{:else}
		{@html block.html}
	{/if}
</p>

<style>
	p > :global(ul) {
		margin: 0;
	}

	:global(.block-type-paragraph p) {
		white-space: pre !important;
	}

	:global(.block-type-code) {
		font-size: 1em;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
			'Courier New', monospace;
	}
</style>
