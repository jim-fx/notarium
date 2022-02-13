<script lang="ts">
	import { createWritableDocumentStore } from '@notarium/data';
	import { createParsedDocumentStore, renderDocument } from './parser';
	import type { IDictionaryDocument } from './parser';
	import type { IDataBackend } from '@notarium/types';
	import type { NotariumDocument } from '@notarium/parser';

	export let backend: IDataBackend<string>;

	const docStore = createWritableDocumentStore(backend);

	export let isEditing = false;

	const blockStore = createParsedDocumentStore(docStore);

	function update(cb: (d: NotariumDocument) => IDictionaryDocument) {
		const newDoc = cb($blockStore);

		const content = renderDocument(newDoc);

		if (content !== $docStore) {
			$docStore = content;
		}
	}
</script>

{#each $blockStore.blocks as block, blockIndex}
	{#if block.type === 'heading'}
		{@html block.html}
	{:else if block.type === 'verbs'}
		<section>
			<h3><b>{block.data.original}</b> - {block.data.translated}</h3>

			{#each block.words as word}
				<p>{word}</p>
			{/each}

			{#if block.data.example}
				<p class="example">
					<b>Example:</b>
					{block.data.example}
				</p>
			{/if}

			{#if isEditing}
				{#if block.data.learned}
					<button
						on:click={() =>
							update((doc) => {
								doc.blocks[blockIndex].data.learned = false;
								return doc;
							})}>done</button
					>
				{:else}
					<button
						on:click={() =>
							update((doc) => {
								doc.blocks[blockIndex].data.learned = true;
								return doc;
							})}>todo</button
					>
				{/if}
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
