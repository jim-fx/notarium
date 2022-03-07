import { createResolvablePromise } from "@notarium/common";
import { applyUpdateV2, Doc } from "yjs";
import type { Adapter, DataCore, File } from "../types";

let rootDoc: Doc;

export default function wrapCRDT(
  file: File,
  data: Uint8Array | undefined,
  adapters: Adapter[]
): DataCore {
  if (!rootDoc) {
    rootDoc = new Doc({ autoLoad: true });
  }

  let doc = rootDoc.getMap().get(file.path) as Doc;
  if (!doc) {
    doc = new Doc({ autoLoad: true });
    rootDoc.getMap().set(file.path, doc);
  }

  if (data) {
    applyUpdateV2(doc, data);
  }

  doc.on("updateV2", (update: Uint8Array, origin) => {
    if (origin) {
      adapters
        .filter((a) => a.id !== origin)
        .map((a) => {
          a.saveFile(file, update);
        });
    } else {
      adapters.forEach((a) => a.saveFile(file, update));
    }
  });

  return {
    getData() {
      return doc;
    },
    async update(cb, adapterId) {
      const [p, resolve] = createResolvablePromise();

      doc.transact(async () => {
        await cb(doc);
        resolve();
      }, adapterId);
      await p;

      if (adapterId) {
        await Promise.all(
          adapters
            .filter((a) => a.id !== adapterId)
            .map((a) => {
              a.saveFile(file);
            })
        );
      } else {
        await Promise.all(adapters.map((a) => a.saveFile(file)));
      }
    },
    destroy() {
      doc.destroy();
    },
  };
}
