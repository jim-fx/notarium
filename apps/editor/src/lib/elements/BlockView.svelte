<script lang="ts">
	import { createWritableDocumentStore } from '@notarium/data';

	import type { NotariumDocument } from '@notarium/parser';
	import type { IDataBackend } from '@notarium/types';

	import * as parsers from '../parsers';

	export let backend: IDataBackend<string>;

	export let isEditing = false;

	const text = createWritableDocumentStore(backend);

	export let parsedDocument: NotariumDocument;
	$: parser = parsedDocument && parsers.getParser(parsedDocument?.frontmatter?.type);
</script>

{#if parser}
	{#if isEditing}
		<svelte:component this={parser.Editor} {text} isEditing />
	{:else}
		<svelte:component this={parser.Viewer} {text} isEditing={false} />
	{/if}
{:else}
	<p>No parser found for type:</p>
	<p>{parsedDocument.frontmatter?.type}</p>
{/if}
