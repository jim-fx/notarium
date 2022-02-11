<script lang="ts">
	import { browser } from '$app/env';

	import { page } from '$app/stores';
	import { directoryStore, documentBackend, hasDocumentIndexMD, isDocumentDir } from '$lib/stores';
	import { IDBAdapter } from '@notarium/adapters';
	import P2PClient from '@notarium/adapters/P2PClient';
	import { createDataBackend } from '@notarium/data';
	import { onMount } from 'svelte';
</script>

isDir: {$isDocumentDir}

hasIndexMD: {$hasDocumentIndexMD}

Directory:
<code>{JSON.stringify($directoryStore)}</code>

<slot />
