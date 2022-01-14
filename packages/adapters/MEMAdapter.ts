import { ITreeAdapter, TreeData } from "@notarium/types";
import { BinarySyncState, SyncState } from "automerge";

export function MEMAdapter(): ITreeAdapter {
  let docData: Record<string, unknown> = {};
  let syncState: Record<string, SyncState> = {};

  return {
    deleteNode(path: string) {
      console.log("delete node", path);
    },
    createNode(path: string, defaultContent?: string) {
      console.log("create node", path);
    },
    async writeDocument(docId: string, doc: unknown) {
      docData[docId] = doc;
    },
    async readDocument(docId: string) {
      return docData[docId] || {};
    },

    async getPeerIds() {
      return Object.keys(syncState);
    },
    async readSyncState(peerId: string) {
      return syncState[peerId];
    },
    async writeSyncState(peerId: string, d: SyncState): Promise<void> {
      syncState[peerId] = d;
    },
  };
}
