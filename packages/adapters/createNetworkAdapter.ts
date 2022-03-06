import { IMessageAdapter } from "@notarium/types";
import type { AdapterFactory, FileSystem, File } from "@notarium/fs";
import { Doc, encodeStateVector } from "yjs";
export function createNetworkAdapter(
  urls: string[],
  adapter: IMessageAdapter
): AdapterFactory {
  return async (fs: FileSystem) => {
    urls.forEach((c) => {
      adapter.connect(c);
    });

    const files = {};

    adapter.on("doc.open", ({ path, stateVector }) => {
      console.log("ws adapter", path, path in files, stateVector);
    });

    return {
      on: adapter.on,
      async requestFile(f: File) {
        if (f.isCRDT) {
          f.getData().then((doc) => {
            const stateVector = encodeStateVector(doc as Doc).join();
            adapter.broadcast("doc.open", { path: f.path, stateVector });
          });
        } else {
          return adapter.requestFile(f.path);
        }
        files[f.path] = f;
      },
      async saveFile(f: File, update: Uint8Array) {},
      async closeFile(f: File) {},
    };
  };
}
