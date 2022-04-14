<script context="module" lang="ts">
	import fs from '$lib/fs';

	export const prerender = true;

	/** @type {import('./[...editPath]').Load} */
	export async function load({ params }) {
		await fs.load();
		const f = fs.openFile(params.editPath);
		await f.load();
		await f.getContext().isLoaded;
		return {
			props: {
				file: f
			}
		};
	}
</script>

<script lang="ts">
	import { activeNode, activeNodeId, offline } from '$lib/stores';

	import { Text, Directory, Image } from '$lib/fileviews';
	import type { File } from '@notarium/fs';

	export let file: File;
</script>

<button on:click={() => ($offline = !$offline)}>Make Offline</button>

{#if !file}
	<p>404</p>
{:else if $activeNode?.mimetype === 'dir'}
	<Directory activeNodeId={$activeNodeId} activeNode={$activeNode} />
{:else if file.isCRDT}
	<Text {file} />
{:else if $activeNode?.mimetype?.startsWith('image/')}
	<Image activeNode={$activeNode} />
	<p>Image</p>
{:else if $activeNode?.mimetype === 'application/pdf'}
	<i>TODO: implement PDF</i>
	<!--<embed src={$activeNodeId} width="500" height="375" type="application/pdf" />-->
{:else}
	<p>No Editor for Mimetype</p>
	<p>{$activeNode?.mimetype}</p>
{/if}
