<script lang="ts">
	import P2PClient from '@notarium/adapters/P2PClient';
	import { onMount } from 'svelte';

	onMount(() => {
		P2PClient.connect('ws://localhost:3000/ws');
	});
</script>

<slot />
