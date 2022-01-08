<script lang="ts">
	import File from '$lib/elements/File.svelte';
import p2p from '@notarium/p2p-client';
import { createSvelteStore } from '@notarium/tree';
	import { IDBAdapter} from '@notarium/tree/src/IDBAdapter';
	import { createTree} from '@notarium/tree/src/Tree';
  import { onMount } from 'svelte';

  const t = createTree(IDBAdapter, p2p);

  const store = createSvelteStore(t);

  function handleDelete(path){
    t.deleteNode(path)
}

$: console.log($store);

  onMount(() => {
    t.load()
    window["t"] = t;
})

</script>


<File file={$store} {handleDelete}></File>
