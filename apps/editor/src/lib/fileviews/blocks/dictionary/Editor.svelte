<script lang="ts">
	import { DictionaryParser } from '@notarium/parser';
	import type { Writable } from 'svelte/store';

	export let text: Writable<string>;

	$: parsed = DictionaryParser.parse($text);

	$: markdown = DictionaryParser.render(parsed);

	$: console.log(parsed);

	function update() {
		$text = markdown;
	}

	$: if (markdown) {
		if (markdown !== $text) {
			update();
		}
	}
</script>

{#each parsed.blocks as block}
	{#if block.type === 'heading'}
		{@html block.html}
	{:else if block.type === 'verb'}
		<section>
			<h3><b>{block.data.original}</b> - {block.data.translated}</h3>

			{#each block.data.conjugations as word}
				<p>{word}</p>
			{/each}

			{#if block.data.example}
				<p class="example">
					<b>Example:</b>
					{block.data.example}
				</p>
			{/if}
		</section>
	{:else if block.type === 'word'}
		<p>
			<b>{block.data.original}</b> - {block.data.translated}
		</p>
	{:else}
		<p>Empty</p>
	{/if}
{/each}

<style>
	section {
		padding: 10px;
		background-color: #f2f2f2;
		border-radius: 3px;
		margin: 10px 0px;
	}

	section > p {
		margin: 2px 0px;
	}

	section > h3 {
		margin-top: 0px;
		margin-bottom: 2px;
	}

	.example {
		padding: 10px;
		border-radius: 2px;
		width: fit-content;
		background-color: lightgray;
		margin-top: 10px;
		margin-bottom: 0px;
	}
</style>
