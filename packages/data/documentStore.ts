import { Readable, readable } from "svelte/store";
import { IDataBackend } from "@notarium/types";

export function createDocumentStore(
  backend: IDataBackend<string>
): Readable<string> {
  const { doc } = backend;
  return readable(doc.getText("content").toString(), function start(set) {
    return backend.doc.on("update", () => {
      console.log("[adapt/store] update content");
      set(doc.getText("content").toString());
    });
  });
}
