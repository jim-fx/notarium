<script lang="ts">
	import type { TreeData } from '@notarium/types';

	export let file: TreeData;
	export let parentPath = '';
	$: ownPath = (parentPath.length ? parentPath : '/') + file.path;
	export let handleDelete: (path: string) => void;
	export let handleCreate: (path: string) => void;
</script>

<div class="wrapper">
	<h3 on:click={() => console.log(file)}>
		<a href="/edit{ownPath}">
			{file.path}
		</a>
	</h3>

	{#if file.children}
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
