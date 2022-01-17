import { IDBPDatabase, openDB, deleteDB } from "idb";
import { IPersistanceAdapter } from "@notarium/types";
import { BinarySyncState } from "automerge";
import { delayExecution } from "@notarium/common";

const getDb = (() => {
  let db: Promise<IDBPDatabase<unknown>>;

  return () => {
    if (db) return db;
    db = openDB("notarium", 1, {
      upgrade(db) {
        db.createObjectStore("documents");
        db.createObjectStore("syncStates");
      },
    });
    return db;
  };
})();

if ("window" in globalThis) {
  window["clearDb"] = async () => {
    await deleteDB("notarium");
    console.log("cleared");
  };
}

export function IDBAdapter<T>(): IPersistanceAdapter<T> {
  const documents: Record<string, T> = {};
  const syncStates: Record<string, Record<string, any>> = {};

  const saveDocument = delayExecution(async (ids) => {
    const db = await getDb();
    ids.forEach(async (id) => {
      await db.put("documents", documents[id], id);
    });
  }, 2000);

  const saveSyncState = delayExecution(async (peerIds) => {
    const db = await getDb();
    peerIds.forEach(async (peerId) => {
      await db.put("syncStates", syncStates[peerId], peerId);
    });
  }, 2000);

  return {
    async loadDocument(docId: string) {
      if (!documents[docId])
        documents[docId] = await (await getDb()).get("documents", docId);
      return documents[docId];
    },
    async saveDocument(docId: string, content: any) {
      documents[docId] = content;
      saveDocument(docId);
    },

    async loadSyncState(peerId: string, docId: string) {
      if (!syncStates?.[peerId]) {
        const db = await getDb();
        syncStates[peerId] = await db.get("syncStates", peerId);
      }
      return syncStates[peerId]?.[docId];
    },
    async saveSyncState(
      peerId: string,
      docId: string,
      d: BinarySyncState
    ): Promise<void> {
      syncStates[peerId] = {
        ...syncStates[peerId],
        [docId]: d,
      };
      saveSyncState(peerId);
    },
  };
}
