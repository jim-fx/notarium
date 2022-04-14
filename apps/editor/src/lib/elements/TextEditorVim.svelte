<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorState } from '@codemirror/state';
	import { EditorView } from '@codemirror/view';
	import { markdown } from '@codemirror/lang-markdown';
	import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
	import { history } from '@codemirror/history';
	import { vim, Vim, getCM } from '@replit/codemirror-vim';
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

	const FontSizeTheme = EditorView.theme({
		'&': {
			fontSize: '12pt'
		},
		'.cm-content': {
			fontFamily: 'Menlo, Monaco, Lucida Console, monospace',
			minHeight: '200px'
		},
		'.cm-gutters': {
			minHeight: '200px'
		},
		'.cm-scroller': {
			overflow: 'auto',
			maxHeight: '600px'
		}
	});

	const vimPlugin = vim();

	const state = EditorState.create({
		doc: yText.toString(),
		extensions: [
			history(),
			oneDarkHighlightStyle,
			vimPlugin,
			markdown(),
			yCollab(yText, provider.awareness, { undoManager }),
			FontSizeTheme
		]
	});

	onMount(() => {
		const view = new EditorView({
			state,
			parent: wrapper,
			theme: [FontSizeTheme]
		});

		const cm = getCM(view);

		window.vim = vimPlugin;
		window.cm = cm;
		window.vimo = Vim;
	});
</script>

<div bind:this={wrapper} />
