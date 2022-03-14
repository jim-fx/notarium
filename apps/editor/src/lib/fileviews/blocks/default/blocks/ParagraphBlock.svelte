<script lang="ts">
	import { onMount } from 'svelte';

	export let block;

	export let edit = false;

	function handleInput(ev) {
		block.md = ev.target.textContent;
	}

	$: classes = edit && getClasses(block);

	function getClasses(b) {
		let _classes = [];
		switch (b.type) {
			case 'heading':
				switch (b.data.weight) {
					case 1:
						_classes.push('text-4xl', 'font-bold');
						break;
					case 2:
						_classes.push('text-xl', 'font-medium');
						break;
					case 3:
						_classes.push('text-lg', 'font-light');
						break;
				}
				break;
			default:
				break;
		}

		return _classes;
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

{#if edit}
	<span
		bind:this={el}
		contenteditable
		on:input={handleInput}
		class={`max-w-full outline-none block-type-${block.type} whitespace-pre-wrap ${classes.join(
			' '
		)}`}
		bind:textContent={block.md}
	/>
{:else}
	<p class="block-type-{block.type}">
		{@html block.html}
	</p>
{/if}

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
