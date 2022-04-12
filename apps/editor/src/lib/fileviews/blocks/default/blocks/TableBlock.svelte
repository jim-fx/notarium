<script lang="ts">
	export let block;
</script>

<table>
	<tr>
		{#each block.data.headers as header}
			<th>{header}</th>
		{/each}
	</tr>

	{#each block.data.rows as row}
		<tr>
			{#each row as c}
				<td>{c}</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
	table {
		border-collapse: collapse;
	}

	th,
	td {
		text-align: left;
		padding: 8px;
	}

	tr:nth-child(even) {
		background-color: #f2f2f2;
	}
</style>
