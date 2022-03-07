<script lang="ts">
	import { activeNode, activeNodeId } from '$lib/stores';

	import { Text, Directory, Image } from '$lib/fileviews';

	function makeOffline() {}
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
