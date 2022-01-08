<script lang="ts">
  export let file:{path:string, children:any[]};
  export let parentPath = ""
  $: ownPath = (parentPath.length?parentPath:"/")+file.path;
  export let handleDelete:(path:string) => void;
</script>

<div class="wrapper">
  <h3>{file.path} <button on:click={() => handleDelete(ownPath)}>delete</button> </h3> 
  {#if file.children}
    {#each file.children as _file }
      <svelte:self file={_file} parentPath={ownPath+"/"} {handleDelete}></svelte:self>
    {/each}
  {/if}

</div>

<style>
  .wrapper{
    padding-left: 10px;
  }
</style>
