<script lang="ts">
	import { createLoader, createConfigStore, createConfig } from '@notarium/data';
	import { activeNode, activeNodeId, treeBackend } from '$lib/stores';

	import { Text, Directory, Image } from '$lib/fileviews';
	import P2PClient from '@notarium/adapters/P2PClient';
	import { IDBAdapter } from '@notarium/adapters';

	let loader: ReturnType<typeof createLoader>;
	function makeOffline() {
		loader = createLoader(treeBackend);
		loader.load((d) => {
			console.log(d);
		});
	}
</script>

<button on:click={makeOffline}>Make Offline</button>

{#if !$activeNode}
	<p>404</p>
{:else if $activeNode?.mimetype === 'dir'}
	<Directory activeNodeId={$activeNodeId} activeNode={$activeNode} />
{:else if $activeNode?.mimetype?.startsWith('text/')}
	<Text activeNode={$activeNode} activeNodeId={$activeNodeId} />
{:else if $activeNode?.mimetype?.startsWith('image/')}
	<Image />
	<p>Image</p>
{:else}
	<p>No Editor for Mimetype</p>
	<p>{$activeNode?.mimetype}</p>
{/if}
