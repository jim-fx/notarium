import { Readable, readable } from "svelte/store";
import { IDirectory } from "@notarium/types";
import type { FileSystem } from "@notarium/fs";
import type { Doc } from "yjs";

export function createTreeStore(fs: FileSystem): Readable<IDirectory> {
  return readable(undefined, function start(set) {
    const tree = fs.openFile("tree");

    fs.isLoaded.then(() => {
      set((tree.getData() as Doc).getMap("tree").toJSON() as IDirectory);
    });

    return tree.on("update", async () => {
      set((tree.getData() as Doc).getMap("tree").toJSON() as IDirectory);
    });
  });
}
