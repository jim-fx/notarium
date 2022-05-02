<script lang="ts">
	import { onMount } from 'svelte';
	import { yCollab } from 'y-codemirror.next';
	import { type Doc, UndoManager } from 'yjs';
	import type { File } from '@notarium/fs';
	import createCodeMirror from './createCodeMirror';

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
		return createCodeMirror(yText.toString(), wrapper, {
			extensions: [yCollab(yText, provider.awareness, { undoManager })]
		});
	});
</script>

<div bind:this={wrapper} />

<style>
	:global(.cm-scroller) {
		max-height: 100% !important;
	}
</style>
