import { readable } from "svelte/store";
import { Tree, TreeData } from "@notarium/types";
import { BinaryDocument } from "automerge";

export function createSvelteStore(tree: Tree) {
  const store = readable(tree.findNode() || {}, function start(set) {
    tree._addAdapter(() => {
      return {
        writeTree: (data: TreeData) => {
          console.log("[adapt/store] update content");
          set(data);
        },
      };
    });

    return () => {};
  });

  return store;
}
