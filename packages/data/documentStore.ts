import { Readable, readable, writable } from "svelte/store";
import { IDataBackend } from "@notarium/types";
import { createDocument } from "./documentFrontend";

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

export function createWritableDocumentStore(backend: IDataBackend<string>) {
  const frontend = createDocument(backend);

  const store = writable(frontend.getText());

  store.subscribe((v) => {
    frontend.setText(v);
  });

  backend.doc.on("update", () => {
    store.set(frontend.getText());
  });

  return store;
}
