<script lang="ts">
	import File from '$lib/elements/File.svelte';
	import P2PClient from '@notarium/adapters/P2PClient';
	import { IDBAdapter } from '@notarium/adapters';
	import { onMount } from 'svelte';
	import { createDataBackend, createTreeStore, createTree } from '@notarium/data';
	import type { TreeData } from '@notarium/types';

	const treeBackend = createDataBackend<Y.Doc>('tree', {
		persistanceAdapterFactory: IDBAdapter,
		messageAdapter: P2PClient
	});

	globalThis['backend'] = treeBackend;

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
		return treeBackend.close;
	});
</script>

{#if $treeStore?.children?.length}
	{#each $treeStore.children as child}
		<File file={child} {handleDelete} {handleCreate} />
	{/each}
{/if}
