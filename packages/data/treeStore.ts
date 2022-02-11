import { Readable, readable } from "svelte/store";
import { IDataBackend, TreeData, YNode } from "@notarium/types";

export function createTreeStore(
  backend: IDataBackend<YNode>
): Readable<TreeData> {
  return readable(
    (backend?.doc?.getMap("tree").toJSON() || {}) as TreeData,
    function start(set) {
      return backend.doc.on("update", () => {
        console.log("[adapt/store] update content");
        set(backend.doc.get("tree").toJSON() as TreeData);
      });
    }
  );
}
