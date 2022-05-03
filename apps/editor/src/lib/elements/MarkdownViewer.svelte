<script lang="ts">
	import { renderMarkdownToHTML } from '@notarium/parser';

	export let text: string = '';
</script>

<span>
	{#if text?.length}
		{@html renderMarkdownToHTML(text)}
	{/if}
</span>
