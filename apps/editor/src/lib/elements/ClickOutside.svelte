<script>
	import { createEventDispatcher } from 'svelte';

	export let exclude = [];

	let child;

	const dispatch = createEventDispatcher();

	function isExcluded(target) {
		var parent = target;

		while (parent) {
			if (exclude.indexOf(parent) >= 0 || parent === child) {
				return true;
			}

			parent = parent.parentNode;
		}

		return false;
	}

	function onClickOutside(event) {
		console.log(child, event.target);
		if (!isExcluded(event.target)) {
			console.log('outside');
			dispatch('clickoutside');
		}
	}
</script>

<svelte:body on:click={onClickOutside} />
<div bind:this={child}>
	<slot />
</div>
