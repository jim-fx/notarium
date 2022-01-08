import { readable } from "svelte/store";

export function createSvelteStore(tree: Tree) {
  const store = readable(tree.getTree() || {}, function start(set) {
    tree._addAdapter(() => {
      return {
        write: (data) => {
          set(data);
        },
      };
    });

    return () => {};
  });

  return store;
}
