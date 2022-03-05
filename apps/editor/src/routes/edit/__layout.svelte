<script lang="ts" context="module">
	import { browser } from '$app/env';

	export async function load({ params }) {
		if (browser) {
			await treeBackend.load();
		}
		return {
			props: {
				editPath: params?.editPath
			}
		};
	}
</script>

<script lang="ts">
	import {
		activeNode,
		hasActiveNodeIndexMD,
		activeNodeId,
		treeBackend,
		configStore
	} from '$lib/stores';

	const config = $configStore;
</script>

<details>
	<summary>
		id: {$activeNodeId}
	</summary>

	<table>
		<tr>
			<td>mimetype</td>
			<td>{$activeNode?.mimetype}</td>
		</tr>
		<tr>
			<td>hasIndexMD</td>
			<td>{$hasActiveNodeIndexMD}</td>
		</tr>

		<tr>
			<td>dir</td>
			<td>
				<code>{JSON.stringify($activeNode)}</code>
			</td>
		</tr>

		<tr>
			<td>Config</td>
			<td>
				<pre>{JSON.stringify($config, null, 2)}</pre>
			</td>
		</tr>
	</table>
</details>

<slot />
