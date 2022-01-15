<script lang="ts">
	import File from '$lib/elements/File.svelte';
	import p2p from '@notarium/p2p-client';
	import { createTreeStore, createTree } from '@notarium/tree';
	import { IDBAdapter, MEMAdapter } from '@notarium/adapters';
	import { onMount } from 'svelte';
	import { createDataBackend } from '@notarium/data';
	import type { TreeData } from '@notarium/types';

	const treeBackend = createDataBackend<TreeData>('tree', IDBAdapter, p2p);

	const treeStore = createTreeStore(treeBackend);

	const tree = createTree(treeBackend);

	function handleDelete(path) {
   console.log("delete path",path)
		tree.deleteNode(path);
	}

	function handleCreate(path) {
   console.log("create path",path)
		tree.createNode(path, 'TestContent');
	}

	onMount(() => {
		treeBackend.load();
		window['t'] = tree;
	});
</script>

{#if $treeStore?.children?.length}
	<File file={$treeStore} {handleDelete} {handleCreate} />
{/if}
