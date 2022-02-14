<script lang="ts">
	import type { IFile } from '@notarium/types';

	export let file: IFile;
	export let parentPath = '';
	$: ownPath = (parentPath.length ? parentPath : '/') + file.path;
	export let handleDelete: (path: string) => void;
	export let handleCreate: (path: string) => void;
</script>

<div class="wrapper">
	<h3>
		<a href="/edit{ownPath}">
			{file.path}
		</a>
	</h3>

	{#if 'children' in file}
		{#each file.children as _file}
			<svelte:self file={_file} parentPath={ownPath + '/'} {handleDelete} {handleCreate} />
		{/each}
	{/if}
</div>

<style>
	.wrapper {
		padding-left: 10px;
	}
</style>
