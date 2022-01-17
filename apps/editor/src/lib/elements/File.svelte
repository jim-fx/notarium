<script lang="ts">
	export let file: { path: string; children: any[] };
	export let parentPath = '';
	$: ownPath = (parentPath.length ? parentPath : '/') + file.path;
	export let handleDelete: (path: string) => void;
	export let handleCreate: (path: string) => void;
</script>

<div class="wrapper">
	<h3>
		{#if file?.children}
			{file.path}
			<button on:click={() => handleDelete(ownPath)}>delete</button>
			{#if !file.children.find((c) => c.path === 'index.md')}
				<button on:click={() => handleCreate(ownPath + '/index.md')}>new</button>
			{/if}
		{:else}
			<a href="/edit{ownPath}">
				{file.path}
			</a>
			<button on:click={() => handleDelete(ownPath)}>delete</button>
		{/if}
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
