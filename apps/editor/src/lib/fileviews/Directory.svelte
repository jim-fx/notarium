<script lang="ts">
	import type { IDirectory } from '@notarium/types';

	export let activeNode: IDirectory;
	export let activeNodeId: string;
</script>

<h3>This is directory:</h3>
<ul>
	{#each activeNode.children as n}
		<li>
			<a href="/edit/{activeNodeId}/{n.path}">{n.path}</a>
		</li>
	{/each}
</ul>
