import { Readable, readable } from "svelte/store";
import { IDataBackend, IDirectory } from "@notarium/types";

export function createTreeStore(backend: IDataBackend): Readable<IDirectory> {
  return readable(
    backend?.doc?.getMap("tree").toJSON() || {},
    function start(set) {
      backend.isLoaded.then(() => {
        set(backend.doc.get("tree").toJSON());
      });
      return backend.doc.on("update", () => {
        console.log("[adapt/store] update content");
        set(backend.doc.get("tree").toJSON());
      });
    }
  );
}
