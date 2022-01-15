<script lang="ts">
	import p2p from '@notarium/p2p-client';
	import { store, setTitle, setText } from '@notarium/document';

	let messages = [];

	p2p.on('sync', (msg) => {
		messages = [...messages, msg];
	});

	let text = $store.content;

	$: if (text && text.length) {
		setText(text);
	}

	store.subscribe((v) => {
		const storeText = v.content.toString();
		if (storeText !== text) {
			text = storeText;
		}
	});

	let inputText;
	function handleKeyDown(ev) {
		if (ev.key === 'Enter') {
			setTitle(inputText);
			inputText = '';
		}
	}
</script>

<pre>

	<code>

		{JSON.stringify($store, null, 2)}

	</code>

</pre>

<textarea name="dude" bind:value={text} cols="30" rows="10" />
<br />
<br />
<input type="text" bind:value={inputText} on:keydown={handleKeyDown} />
