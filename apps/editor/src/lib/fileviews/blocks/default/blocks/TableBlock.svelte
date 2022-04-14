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
		border: solid thin lightgray;
	}

	th,
	td {
		text-align: left;
		padding: 8px;
		border-right: solid thin lightgray;
	}

	tr > td:last-child,
	tr > th:last-child {
		border-right: none !important;
	}

	tr:nth-child(even) {
		background-color: #f2f2f2;
	}
</style>
