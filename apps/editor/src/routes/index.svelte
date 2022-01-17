<script lang="ts">
	import File from '$lib/elements/File.svelte';
	import P2PClient from '@notarium/adapters/P2PClient';
	import { IDBAdapter } from '@notarium/adapters';
	import { onMount } from 'svelte';
	import { createDataBackend, createTreeStore, createTree } from '@notarium/data';
	import type { TreeData } from '@notarium/types';

	const treeBackend = createDataBackend<TreeData>('tree', IDBAdapter, P2PClient);

	const treeStore = createTreeStore(treeBackend);

	const tree = createTree(treeBackend);

	function handleDelete(path) {
		console.log('delete path', path);
		tree.deleteNode(path);
	}

	function handleCreate(path) {
		console.log('create path', path);
		tree.createNode(path, 'TestContent');
	}

	onMount(() => {
		treeBackend.load();
		window['t'] = tree;
		return treeBackend.close;
	});
</script>

{#if $treeStore?.children?.length}
	<File file={$treeStore} {handleDelete} {handleCreate} />
{/if}
