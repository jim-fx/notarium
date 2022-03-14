import { File } from "@notarium/fs";
import { readable } from "svelte/store";
export function createConfigStore(f: File) {
  return readable(f.context.get(), (set) => {
    f.on("context", (c) => set(c));
    f.context.isLoaded.then(() => set(f.context.get()));
  });
}
