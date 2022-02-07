import { Readable, readable } from "svelte/store";
import { IDataBackend, TreeData } from "@notarium/types";

export function createTreeStore(
  backend: IDataBackend<TreeData>
): Readable<TreeData> {
  return readable(
    (backend?.doc?.toJSON() || {}) as TreeData,
    function start(set) {
      return backend.doc.on("update", () => {
        console.log("[adapt/store] update content");
        set(backend.doc.get("tree").toJSON() as TreeData);
      });
    }
  );
}
