<script lang="ts">
	import p2p from '@notarium/p2p-client';

	let messages = [];

	p2p.on('message', (msg) => {
		messages = [...messages, msg];
	});

	let inputText;
	function handleKeyDown(ev) {
		if (ev.key === 'Enter') {
			messages = [...messages, inputText];
			p2p.send('message', inputText);
			inputText = '';
		}
	}
</script>

<h1>hi from root</h1>

{#each messages as msg}
	<p>{msg}</p>
{/each}

<input type="text" bind:value={inputText} on:keydown={handleKeyDown} />
