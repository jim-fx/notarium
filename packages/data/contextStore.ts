import { File } from "@notarium/fs";
import { readable } from "svelte/store";
export function createContextStore(f: File) {
  const context = f.getContext()
  return readable(context.get(), (set) => {
    f.on("context", (c) => set(c));
    context.isLoaded.then(() => set(context.get()));
  });
}
