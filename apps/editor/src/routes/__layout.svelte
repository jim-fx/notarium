<script lang="ts">
	import File from '$lib/elements/File.svelte';
	import { onMount } from 'svelte';

	import { treeBackend, treeFrontend, treeStore } from '$lib/stores';

	import './app.css';

	function handleDelete(path: string) {
		console.log('delete path', path);
		treeFrontend.deleteNode(path);
	}

	function handleCreate(path: string) {
		console.log('create path', path);
		treeFrontend.createNode(path, 'TestContent');
	}
	onMount(() => {
		treeBackend.connect('ws://localhost:3000/ws');
		treeBackend.load();
		return treeBackend.close;
	});
</script>

<main>
	<aside>
		{#if $treeStore?.children?.length}
			{#each $treeStore.children as child}
				<File file={child} {handleDelete} {handleCreate} />
			{/each}
		{/if}
	</aside>

	<section>
		<slot />
	</section>
</main>

<style>
	aside,
	section {
		max-height: 100vh;
		overflow-y: auto;
		padding: 5px 10px;
		box-sizing: border-box;
	}
	main {
		display: grid;
		grid-template-columns: min-content 1fr;
	}
</style>
