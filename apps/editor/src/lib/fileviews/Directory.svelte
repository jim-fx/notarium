<script lang="ts">
	import fs from '$lib/fs';
	import type { IDirectory } from '@notarium/types';

	export let activeNode: IDirectory;
	export let activeNodeId: string;

	$: hasIndexMD = activeNode && !!activeNode.children.find((c) => c.path === 'index.md');

	function addIndexMD() {
		fs.createFile(activeNodeId + '/index.md');
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
