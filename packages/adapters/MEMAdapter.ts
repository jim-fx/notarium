import type { IDataBackend, IPersistanceAdapter } from "@notarium/types";
import * as Y from "yjs";

export function MEMAdapter<T>(backend: IDataBackend<T>): IPersistanceAdapter {
  let docData: Record<string, T | Uint8Array> = {};

  return {
    async saveDocument(doc: Y.Doc) {
      docData[backend.docId] = Y.encodeStateAsUpdate(backend.doc);
    },
    async loadDocument(docId: string, fsPath?: string) {
      if (docId === "tree" && fsPath) {
        return {
          path: "test",
          children: [{ path: "home", children: [] }],
        } as unknown as T;
      }
      return docData[docId];
    },
  };
}
