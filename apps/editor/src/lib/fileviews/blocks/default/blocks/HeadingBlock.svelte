<script lang="ts">
	import { onMount } from 'svelte';

	export let block;

	onMount(() => {
		[...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].forEach((el) => {
			el.setAttribute('id', el.textContent.split(' ').join(''));
		});
	});
</script>

{@html block.html}
