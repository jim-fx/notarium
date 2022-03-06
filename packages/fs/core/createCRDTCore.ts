import { createResolvablePromise } from "@notarium/common";
import { Doc } from "yjs";
import type { Adapter, File } from "../types";

let rootDoc: Doc;

export default function wrapCRDT(
  file: File,
  data: Uint8Array | undefined,
  adapters: Adapter[]
) {
  if (!rootDoc) {
    rootDoc = new Doc({ autoLoad: true });
  }

  let doc = rootDoc.getMap().get(file.path) as Doc;
  if (!doc) {
    doc = new Doc({ autoLoad: true });
    rootDoc.getMap().set(file.path, doc);
  }

  doc.on("updateV2", (update: Uint8Array) => {
    adapters.forEach((a) => a.saveFile(file, update));
  });

  return {
    getData() {
      return doc;
    },
    async update(cb, originAdapter) {
      const [p, resolve] = createResolvablePromise();

      doc.transact(async () => {
        await cb(doc);
        resolve();
      });
      await p;

      await Promise.all(adapters.map((a) => a.saveFile(file)));
    },
    destroy() {
      doc.destroy();
    },
  };
}
