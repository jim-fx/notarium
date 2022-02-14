<script lang="ts">
	import { createLoader } from '@notarium/data';
	import { activeNode, activeNodeId, treeBackend } from '$lib/stores';

	import { Config, Text, Directory, Image } from '$lib/fileviews';

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
{:else if $activeNode?.mimetype === 'nota/config'}
	<Config activeNodeId={$activeNodeId} activeNode={$activeNode} />
{:else if $activeNode?.mimetype?.startsWith('text/')}
	<Text activeNode={$activeNode} activeNodeId={$activeNodeId} />
{:else if $activeNode?.mimetype?.startsWith('image/')}
	<p>Image</p>
{:else}
	<p>No Editor for Mimetype</p>
{/if}
