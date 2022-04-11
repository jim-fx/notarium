import { Readable, readable, writable } from "svelte/store";
import { createDocumentFrontend } from "./documentFrontend";
import { File } from "@notarium/fs";
import { Doc } from "yjs";

export function createDocumentStore(file: File): Readable<string> {
  const frontend = createDocumentFrontend(file);

  return readable(frontend.getText(), function start(set) {
    file.isLoaded.then(() => {
      set(frontend.getText());
    });
    return file.getData().on("update", () => {
      console.log("UUPDATE")
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
  console.log({ frontend, file })

  function handleBackendUpdate() {
    console.log("UUPDATE")
    const v = frontend.getText();
    if (v === value) return;
    value = v;
    store.set(v);
  }

  (file.getData() as Doc).on("update", () => handleBackendUpdate());

  file.isLoaded.then(() => handleBackendUpdate());

  return store;
}
