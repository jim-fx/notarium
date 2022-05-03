<script>
	import { Editor, Viewer } from 'bytemd';
	import gfm from '@bytemd/plugin-gfm';

	export let value;
	const plugins = [
		gfm()
		// Add more plugins here
	];

	function handleChange(e) {
		value = e.detail.value;
	}
</script>

<template>
	<Editor {value} {plugins} on:change={handleChange} />
</template>
