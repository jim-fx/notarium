import { Readable, readable } from "svelte/store";
import { IDataBackend, DocumentData } from "@notarium/types";

export function createDocumentStore(
  backend: IDataBackend<DocumentData>
): Readable<string> {
  const { doc } = backend;
  return readable(doc.getText("content").toString(), function start(set) {
    return backend.doc.on("update", () => {
      console.log("[adapt/store] update content");
      console.log("content", doc.toJSON());
      set(doc.getText("content").toString());
    });
  });
}
