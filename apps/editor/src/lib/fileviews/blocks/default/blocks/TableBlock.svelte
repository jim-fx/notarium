<script lang="ts">
	export let block;
</script>

<table class="border-collapse space-y-6 p-4 rounded-md divide-y divide-opacity-30 divide-gray-50">
	<tr class="divide-x divide-opacity-30 divide-gray-50">
		{#each block.data.headers as header}
			<th class="p-2 font-bold">{header}</th>
		{/each}
	</tr>

	{#each block.data.rows as row}
		<tr class="divide-x divide-gray-50 divide-opacity-30">
			{#each row as c}
				<td class="p-2">{c}</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
	table {
		border-spacing: 15px 15px;
	}
</style>
