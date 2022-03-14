<script lang="ts" context="module">
	import { browser } from '$app/env';

	export async function load({ params }) {
		if (browser) {
			await fs.load();
		}
		return {
			props: {
				editPath: params?.editPath
			}
		};
	}
</script>

<script lang="ts">
	import fs from '$lib/fs';
	import { activeNode, hasActiveNodeIndexMD, activeNodeId, activeFile } from '$lib/stores';
	import { createConfigStore } from '@notarium/data';

	$: context = $activeFile && createConfigStore($activeFile);
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
			<td>Context</td>
			<td>
				<code>{JSON.stringify($context)}</code>
			</td>
		</tr>

		<tr>
			<td>dir</td>
			<td>
				<code>{JSON.stringify($activeNode)}</code>
			</td>
		</tr>
	</table>
</details>

<slot />
