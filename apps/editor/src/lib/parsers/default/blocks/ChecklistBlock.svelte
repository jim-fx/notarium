<script>
	import { tick } from 'svelte';
	import { scale } from 'svelte/transition';

	export let block;

	export let edit = false;

	const defaultItem = { checked: false, text: 'List Item' };

	function handleNew() {
		block.data = [...block.data, { ...defaultItem }];
	}

	async function handleInput(ev, i) {
		if (edit) {
			ev.preventDefault();
			ev.stopPropagation();
			block.data[i].checked = !block.data[i].checked;
			block.data = block.data;
		}
	}

	function cursor_position() {
		const sel = document.getSelection();
		const pos = sel.toString().length;
		if (sel.anchorNode != undefined) sel.collapseToEnd();
		return pos;
	}

	let activeItem = -5;

	async function handleKeyDown(ev, i) {
		const content = ev.target.textContent;

		if (ev.key === 'Escape') {
			ev.target.blur();
			activeItem = -1;
		}

		if (ev.key === 'Enter') {
			const cPos = cursor_position();
			ev.preventDefault();
			ev.target.blur();

			let newItem = { ...defaultItem };

			if (cPos !== content.length) {
				const oldText = content.slice(0, cPos);
				const newText = content.slice(cPos, content.length);
				if (oldText.trim().length) block.data[i].text = oldText;
				if (newText.trim().length) newItem.text = newText;
			}
			block.data.splice(i + 1, 0, newItem);
			block.data = block.data;
			let _i = i;
			await tick();
			setTimeout(() => {
				activeItem = _i;
			}, 500);
		}
	}

	function handleRemove(i) {
		block.data = block.data.filter((_, _i) => i !== _i);
	}

	$: done = block.data.filter((v) => v.checked).length;
	$: percent = Math.floor((done / block.data.length) * 100);
</script>

{activeItem}

{#if block.data.length > 5}
	<i class="opacity-50 text-xs">{percent}% ({done}/{block.data.length})</i>
{/if}

{#each block.data as item, i}
	<div class="flex items-center">
		{#if edit}
			<button transition:scale class="mr-2 text-xs" on:click={() => handleRemove(i)}>✕</button>
		{/if}

		{#if item.checked}
			<input
				type="checkbox"
				class="text-blue-light"
				checked={true}
				on:click={(ev) => handleInput(ev, i)}
			/>
		{:else}
			<input
				type="checkbox"
				class="text-blue-light"
				checked={false}
				on:click={(ev) => handleInput(ev, i)}
			/>
		{/if}

		<p
			contenteditable
			class="ml-2 w-full p-0.5"
			autofocus={i === activeItem}
			bind:textContent={item.text}
			on:keydown={(ev) => handleKeyDown(ev, i)}
		>
			{item.text}
		</p>
	</div>
{/each}

{#if edit}
	<button transition:scale class="elevated" on:click={handleNew}>Add</button>
{/if}

<style>
	input {
		border-radius: 4px;
	}
</style>
