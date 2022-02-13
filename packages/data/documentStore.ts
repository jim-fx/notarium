import { Readable, readable, writable } from "svelte/store";
import { IDataBackend } from "@notarium/types";
import { createDocument } from "./documentFrontend";

export function createDocumentStore(
  backend: IDataBackend<string>
): Readable<string> {
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

export function createWritableDocumentStore(backend: IDataBackend<string>) {
  const frontend = createDocument(backend);

  let value = frontend.getText();

  const store = writable(value);

  store.subscribe((v) => {
    if (v === value) return;
    value = v;
    console.log("UP1: ", v);
    frontend.setText(v);
  });

  backend.doc.on("update", () => {
    const v = frontend.getText();
    if (v === value) return;
    value = v;
    console.log("UP2: ", v);
    store.set(v);
  });

  backend.isLoaded.then(() => {
    const v = frontend.getText();
    if (v === value) return;
    value = v;
    console.log("UP3: ", v);
    store.set(v);
  });

  return store;
}
