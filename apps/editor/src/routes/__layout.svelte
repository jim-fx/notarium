<script lang="ts">
	import './app.css';
	import { onMount } from 'svelte';
	import { localStore } from '$lib/stores';

	import fs from '$lib/fs';

	const loadOffline = localStore.get('load-offline', false);
	const hideTree = localStore.get('show-tree', false);

	$: if ($loadOffline) {
		console.log('LLLOOOAD');
	}

	function handleDelete(path: string) {
		fs.deleteFile(path);
	}

	function handleCreate(path: string) {
		fs.createFile(path, 'text/markdown');
	}

	onMount(async () => {
		/* const channel = new BroadcastChannel('sw-messages'); */

		/* createBinaryHandler(channel); */

		await fs.load();
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
