<script lang="ts" context="module">
	import { treeBackend, treeFrontend, treeStore } from '$lib/stores';

	export async function load() {
		if (browser) {
			treeBackend.connect('ws://localhost:3000/ws');
			await treeBackend.load();
		}
		return {
			props: {
				backend: treeBackend
			}
		};
	}
</script>

<script lang="ts">
	import './app.css';
	import File from '$lib/elements/File.svelte';
	import { onMount } from 'svelte';
	import { localStore } from '$lib/stores';

	import { browser } from '$app/env';

	export let backend;

	const loadOffline = localStore.get('load-offline', false);

	const hideTree = localStore.get('show-tree', false);

	$: if ($loadOffline) {
		console.log('LLLOOOAD');
	}

	function handleDelete(path: string) {
		treeFrontend.deleteNode(path);
	}

	function handleCreate(path: string) {
		treeFrontend.createNode(path, 'text/markdown');
	}

	onMount(async () => {
		await backend.load();
	});
</script>

<main class:hide-tree={$hideTree}>
	<aside>
		<header>
			<button
				on:click={() => {
					$hideTree = !$hideTree;
				}}>hide</button
			>
		</header>
		{#if $treeStore.mimetype === 'dir'}
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
		grid-template-columns: auto 1fr;
	}

	aside > header {
		display: grid;
		justify-content: end;
	}

	main.hide-tree {
		grid-template-columns: 60px 1fr;
	}

	main.hide-tree > aside {
		opacity: 0.8;
	}
</style>
