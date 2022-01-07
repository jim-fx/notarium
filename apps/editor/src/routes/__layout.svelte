<script lang="ts">
	import { browser } from '$app/env';

	import p2p from '@notarium/p2p-client';

	if (browser) {
		p2p.connectWebSocket('ws://localhost:3000/ws');
	}
</script>

<slot />
