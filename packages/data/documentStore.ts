import { Readable, readable, writable } from "svelte/store";
import { createDocumentFrontend } from "./documentFrontend";
import { File } from "@notarium/fs";

export function createDocumentStore(file: File): Readable<string> {
  const frontend = createDocumentFrontend(file);

  return readable(frontend.getText(), function start(set) {
    file.isLoaded.then(() => {
      set(frontend.getText());
    });
    return file.on("update", () => {
      set(frontend.getText());
    });
  });
}

export function createWritableDocumentStore(file: File) {
  const frontend = createDocumentFrontend(file);

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

  file.on("update", () => handleBackendUpdate());

  file.isLoaded.then(() => handleBackendUpdate());

  return store;
}
