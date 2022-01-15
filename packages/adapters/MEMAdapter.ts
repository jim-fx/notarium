import type { IPersistanceAdapter } from "@notarium/types";
import type { BinaryDocument, BinarySyncState } from "automerge";

export function MEMAdapter<T>(): IPersistanceAdapter<T> {
  let docData: Record<string, T | BinaryDocument> = {};
  let syncState: Record<string, Record<string, BinarySyncState>> = {};

  return {
    async saveDocument(docId: string, doc: BinaryDocument) {
      docData[docId] = doc;
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

    async loadSyncState(peerId: string, docId: string) {
      return syncState[peerId]?.[docId];
    },
    async saveSyncState(
      peerId: string,
      docId: string,
      d: BinarySyncState
    ): Promise<void> {
      syncState[peerId] = {
        ...syncState[peerId],
        [docId]: d,
      };
    },
  };
}
