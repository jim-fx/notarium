import { Readable, readable, writable } from "svelte/store";
import { IDataBackend } from "@notarium/types";
import { createDocument } from "./documentFrontend";

export function createDocumentStore(backend: IDataBackend): Readable<string> {
  const frontend = createDocument(backend);

  return readable(frontend.getText(), function start(set) {
    backend.isLoaded.then(() => {
      set(frontend.getText());
    });
    return backend.doc.on("update", () => {
      set(frontend.getText());
    });
  });
}

export function createWritableDocumentStore(backend: IDataBackend) {
  const frontend = createDocument(backend);

  let value = frontend.getText();

  const store = writable(value);

  store.subscribe((v) => {
    if (v === value) return;
    value = v;
    frontend.setText(v);
  });

  function handleBackendUpdate() {
    const v = frontend.getText();
    if (v === value) return;
    value = v;
    store.set(v);
  }

  backend.doc.on("update", () => handleBackendUpdate());

  backend.isLoaded.then(() => handleBackendUpdate());

  return store;
}
