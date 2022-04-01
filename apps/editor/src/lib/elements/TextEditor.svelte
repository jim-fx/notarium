<script lang="ts">
	import { createEventDispatcher, tick, onMount, onDestroy } from 'svelte';
	import { EditorState } from '@codemirror/state';
	import { EditorView, ViewUpdate } from '@codemirror/view';
	import { markdown } from '@codemirror/lang-markdown';
	import { oneDark, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
	import { history } from '@codemirror/history';
	import { vim } from '@replit/codemirror-vim';

	export let value: string = ''; // String, required
	export let lang: string = 'markdown'; // String

	let wrapper: HTMLDivElement;

	function handleUpdate(update: ViewUpdate) {
		console.log(update.state.toJSON().doc);
		value = update.state.toJSON().doc;
	}

	onMount(() => {
		const state = EditorState.create({
			doc: value,
			extensions: [
				EditorView.updateListener.of(handleUpdate),
				history(),
				oneDarkHighlightStyle,
				vim(),
				markdown()
			]
		});

		const view = new EditorView({
			state,
			parent: wrapper
		});

		console.log({ state, view });
	});
</script>

<div bind:this={wrapper} />
