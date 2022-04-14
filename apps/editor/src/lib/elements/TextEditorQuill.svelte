<script lang="ts">
	import 'quill/dist/quill.snow.css';
	import type { File } from '@notarium/fs';
	import { QuillBinding } from 'y-quill';
	import QuillMarkdown from 'quilljs-markdown';
	import { onMount } from 'svelte';
	import 'quilljs-markdown/dist/quilljs-markdown-common-style.css';
	import { createWritableDocumentStore } from '@notarium/data';

	export let file: File;

	let wrapper: HTMLElement;

	const yText = (file.getData() as Doc).getText('content');

	const provider = file.stuff['yjs.ws'] || file.stuff['yjs.rtc'];

	onMount(async () => {
		const { default: Quill } = await import('quill');
		const { default: QuillCursors } = await import('quill-cursors');
		Quill.register('modules/cursors', QuillCursors);
		var editor = new Quill(wrapper, {
			modules: {
				cursors: true
			},
			placeholder: yText.toString(),
			history: {
				userOnly: true
			},
			theme: 'snow' // or 'bubble'
		});

		// Optionally specify an Awareness instance, if supported by the Provider
		const binding = new QuillBinding(yText, editor, provider.awareness);

		const quillMarkdown = new QuillMarkdown(editor, {});

		return () => {
			quillMarkdown.destroy();
			editor.destroy();
		};
	});
</script>

<div>
	<div bind:this={wrapper} />
</div>
