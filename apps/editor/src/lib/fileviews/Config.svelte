<script lang="ts">
	export let activeNodeId: string;
	export let activeNode: any;
</script>

<h2>Config:</h2>
id:{activeNodeId}
<pre>{JSON.stringify(activeNode)}</pre>
