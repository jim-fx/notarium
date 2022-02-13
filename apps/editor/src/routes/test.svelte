<script lang="ts">
	import * as Y from 'yjs';

	const doc = new Y.Doc();

	doc.on('update', (up) => {
		console.log('update', up);
	});

	const click = () =>
		doc.transact(({ doc }) => {
			const t = doc.getText('main');

			t.insert(0, 'a');
		});
</script>

<h1 on:click={click}>Hel</h1>
