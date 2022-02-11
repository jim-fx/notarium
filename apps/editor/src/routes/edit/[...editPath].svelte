<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';

	import { createWritableDocumentStore } from '@notarium/data';
	import { documentBackend, isDocumentDir, isEditing } from '$lib/stores';

	const possibleStates = ['text', 'block'] as const;
	let state: typeof possibleStates[number] = 'text';

	$: text = $documentBackend && createWritableDocumentStore($documentBackend);
</script>

{#if $isDocumentDir}
	<h1>Eyy, this is a directory</h1>
{:else}
	<header>
		{#each possibleStates as s}
			<button
				on:click={() => {
					state = s;
				}}>{s}</button
			>
		{/each}

		{#if $isEditing}
			<button
				on:click={() => {
					$isEditing = false;
				}}>exit edit</button
			>
		{:else}
			<button
				on:click={() => {
					$isEditing = true;
				}}>edit</button
			>
		{/if}
	</header>

	{#if state === 'text'}
		{#if $isEditing}
			<textarea name="dude" bind:value={$text} cols="30" rows="10" />
		{:else}
			<SvelteMarkdown source={$text} />
		{/if}
	{:else if state === 'block'}
		{#if $isEditing}
			<p>BLOCK-EDITOR</p>
		{:else}
			<p>BLOCK</p>
		{/if}
	{/if}
{/if}

<style>
	textarea {
		height: 90vh;
		width: 100%;
	}
</style>
