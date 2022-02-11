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
	import { activeNode, hasActiveNodeIndexMD, activeNodeId, treeBackend } from '$lib/stores';
</script>

<details style:display="none">
	<summary>
		id: {$activeNodeId}
	</summary>

	mimeType: {$activeNode?.mimetype} <br />
	hasIndexMD: {$hasActiveNodeIndexMD} <br />
	Directory:
	<code>{JSON.stringify($activeNode)}</code>
</details>

<slot />
