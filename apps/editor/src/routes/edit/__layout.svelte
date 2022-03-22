<script lang="ts" context="module">
	import { browser } from '$app/env';

	export async function load({ params }) {
		await fs.load();
		const f = fs.openFile(params.editPath);
		await f.load();
		await f.context.isLoaded;

		return {
			props: {
				file: f
			}
		};
	}
</script>

<script lang="ts">
	import fs from '$lib/fs';
	import { activeNode, hasActiveNodeIndexMD, activeNodeId } from '$lib/stores';
	import { createConfigStore } from '@notarium/data';
	import type { File } from '@notarium/fs';

	export let file: File;

	const context = createConfigStore(file);
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
