<script context="module" lang="ts">
	export function load({ params }) {
		return {
			props: {
				path: params?.path?.split('/').filter((v) => v.length)
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { createDataBackend } from '@notarium/data';
	import { IDBAdapter } from '@notarium/adapters';
	import * as p2p from '@notarium/p2p-client';

	export let path;

	const backend = createDataBackend(path.join('/'), IDBAdapter, p2p);

	const tree = createTree(backend);

	onMount(() => {});
</script>

{JSON.stringify(path, null, 2)}
