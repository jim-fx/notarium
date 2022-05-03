<script lang="ts">
	import { localStore } from '$lib/stores';
	import { getParser } from '$lib/fileviews/blocks';

	const defaultText = `# Editor Test
## Heading 2
### Heading 3

This is the editor test. And this block should be a simple paragraph.
That has two lines.

| asd | asd | asd | asd |
|-----|-----|-----|-----|
|  1  |  2  |  4  |  5  |
|  5  |  1  |  5  |  9  |

> Quotes?
> asdasd
> asdasd

**Checklists**

- [ ] One
- [ ] Two
- [ ] Three
- [ ] Four

\`\`\`bash
> echo Sup? | cowsay
\`\`\`
`;

	const text = localStore.get('editor-text', defaultText);

	let type = 'def';
	let debug = localStore.get('editor-debug', false);

	$: Editor = getParser(type);
</script>

<button on:click={() => (type = type === 'def' ? 'dictionary' : 'def')}>s</button>
<button on:click={() => ($text = defaultText)}>reset</button>
<label for="debug" />
<input type="checkbox" bind:checked={$debug} name="" id="debug" />

{type}

<svelte:component this={Editor} {text} debug={$debug} />
