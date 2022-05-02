<script lang="ts">
	import { onMount } from 'svelte';
	import { localStore } from '$lib/stores';
	import parseDocument from '@notarium/parser/generic/parseDocument';
	import renderDocumentToMarkdown from '@notarium/parser/generic/renderDocument';
	import { renderMarkdownToHTML } from '@notarium/parser';

	import BlockEditor from '$lib/fileviews/blocks/default/Editor.svelte';
	import createCodeMirror from '$lib/elements/createCodeMirror';
	import { EditorView, ViewUpdate } from '@codemirror/view';

	const text = localStore.get('parser-text', '# Empty');

	let editable = false;

	$: parserOutput = parseDocument($text);

	let wrapper: HTMLDivElement;

	onMount(() => {
		return createCodeMirror($text, wrapper, {
			extensions: [
				EditorView.updateListener.of((v: ViewUpdate) => {
					if (v.docChanged) {
						$text = v.state.toJSON().doc;
					}
				})
			]
		});
	});
</script>

<div class="wrapper">
	<div class="code" bind:this={wrapper} />
	<div class="render">
		<header>HTML</header>
		<header>
			BLOCKS &nbsp; &nbsp; &nbsp;
			<label for="edit">Edit</label>
			<input type="checkbox" name="" id="edit" bind:checked={editable} />
		</header>
		<div class="html">
			{@html renderMarkdownToHTML($text)}
		</div>
		<div class="blocks">
			<BlockEditor isEditing={editable} {text} />
		</div>
	</div>
	<div class="markdown">{@html renderDocumentToMarkdown(parserOutput)}</div>
	<div class="json">
		<code>
			<pre>{JSON.stringify(parserOutput, null, 2)}</pre>
		</code>
	</div>
</div>

<style>
	.code,
	.markdown {
		min-width: 300px;
	}

	.code::before {
		content: 'Input';
	}

	.json::before {
		content: 'JSON';
	}

	.markdown::before {
		content: 'MD';
	}

	.code::before,
	.markdown::before,
	.json::before {
		position: absolute;
		padding: 5px;
		margin-top: -40px;
		left: 0px;
		box-sizing: border-box;
		width: 100%;
		background-color: white;
		border-radius: 5px 5px 0px 0px;
		border-bottom: solid thin black;
	}

	.markdown {
		white-space: break-spaces;
	}

	.json {
		overflow-x: scroll;
	}

	.wrapper > div {
		position: relative;
		box-sizing: border-box;
		border: solid thin black;
		border-radius: 5px;
		padding: 10px;
		padding-top: 40px;
	}
	.wrapper {
		padding: 10px;
		box-sizing: border-box;
		overflow: hidden;
		width: 100vw;
		height: 100vh;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 10px 10px;
	}

	.render {
		display: grid;
		padding-top: 10px !important;
		grid-template-columns: 1fr 1fr;
		overflow-y: scroll;
	}

	.blocks {
		border-left: solid thin black;
	}

	header {
		border-bottom: solid thin black;
	}
</style>
