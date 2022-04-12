<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorState } from '@codemirror/state';
	import { EditorView } from '@codemirror/view';
	import { markdown } from '@codemirror/lang-markdown';
	import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
	import { history } from '@codemirror/history';
	import { vim } from '@replit/codemirror-vim';
	import { yCollab } from 'y-codemirror.next';
	import { type Doc, UndoManager } from 'yjs';
	import type { File } from '@notarium/fs';

	export let file: File; // String, required
	/* export let lang: string = 'markdown'; // String */

	let wrapper: HTMLDivElement;

	const doc = file.getData() as Doc;
	const yText = doc.getText('content');

	const provider = file.stuff['yjs.ws'] || file.stuff['yjs.rtc'];
	provider.awareness.setLocalStateField(Math.random() + '', {
		name: 'Anonymous ' + Math.floor(Math.random() * 100),
		color: 'red',
		colorLight: 'red'
	});

	const undoManager = new UndoManager(yText);

	onMount(() => {
		const state = EditorState.create({
			doc: yText.toString(),
			extensions: [
				history(),
				oneDarkHighlightStyle,
				vim(),
				markdown(),
				yCollab(yText, provider.awareness, { undoManager })
			]
		});

		const view = new EditorView({
			state,
			parent: wrapper
		});
	});
</script>

<div bind:this={wrapper} />
