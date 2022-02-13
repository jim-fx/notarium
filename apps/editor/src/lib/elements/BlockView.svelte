<script lang="ts">
	import { createWritableDocumentStore } from '@notarium/data';

	import type { NotariumDocument } from '@notarium/parser';
	import type { IDataBackend } from '@notarium/types';

	import * as parsers from '../parsers';

	export let backend: IDataBackend<string>;

	export let isEditing = false;

	$: text = backend && createWritableDocumentStore(backend);

	export let parsedDocument: NotariumDocument;
	$: parser = parsers.getParser(parsedDocument?.frontmatter?.type);
</script>

{#if parser}
	<svelte:component this={isEditing ? parser.Editor : parser.Viewer} {text} {isEditing} />
{:else}
	<p>No parser found for type:</p>
	<p>{parsedDocument.frontmatter?.type}</p>
{/if}
