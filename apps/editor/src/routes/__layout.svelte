<script lang="ts">
	import p2p from '@notarium/p2p-client';
	import { onMount } from 'svelte';

	onMount(() => {
		p2p.connectWebSocket('ws://localhost:3000/ws');
	});
</script>

<slot />
