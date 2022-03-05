<script lang="ts">
	import { treeFrontend } from '$lib/stores';
	import type { IDirectory } from '@notarium/types';

	export let activeNode: IDirectory;
	export let activeNodeId: string;

	$: hasIndexMD = activeNode && !!activeNode.children.find((c) => c.path === 'index.md');

	function addIndexMD() {
		treeFrontend.createNode(activeNodeId + '/index.md', 'text/markdown');
	}
</script>

<h3>This is directory:</h3>
<ul>
	{#each activeNode.children as n}
		<li>
			<a href="/edit/{activeNodeId}/{n.path}">{n.path}</a>
		</li>
	{/each}
</ul>

<button>Add new Dir</button>
{#if !hasIndexMD}
	<button on:click={addIndexMD}>Add index.md</button>
{/if}
