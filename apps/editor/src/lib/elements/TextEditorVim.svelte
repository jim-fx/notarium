<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorState } from '@codemirror/state';
	import { EditorView } from '@codemirror/view';
	import { history } from '@codemirror/commands';
	import { materialDark } from 'cm6-theme-material-dark';
	import { markdown } from '@codemirror/lang-markdown';
	import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';

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
		},
		'.cm-o-replacement': {
			display: 'inline-block',
			width: '.5em',
			height: '.5em',
			borderRadius: '.25em'
		}
	});

	onMount(() => {
		const state = EditorState.create({
			doc: yText.toString(),
			extensions: [
				history(),
				syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
				bracketMatching(),
				vim(),
				markdown(),
				yCollab(yText, provider.awareness, { undoManager }),
				FontSizeTheme
			]
		});

		const view = new EditorView({
			state,
			parent: wrapper
		});

		/* const cm = getCM(view); */
	});
</script>

<div bind:this={wrapper} />

<style>
	:global(.cm-scroller) {
		max-height: 100% !important;
	}
</style>
