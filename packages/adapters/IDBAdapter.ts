import { IDBPDatabase, openDB, deleteDB } from "idb";
import { IPersistanceAdapter, ITreeAdapter, TreeData } from "@notarium/types";
import { BinaryDocument, BinarySyncState, FreezeObject, save } from "automerge";

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
  return {
    async loadDocument(docId: string) {
      return (await getDb()).get("documents", docId);
    },
    async saveDocument(docId: string, content: any) {
      await (await getDb()).put("documents", content, docId);
    },

    async loadSyncState(peerId: string, docId: string) {
      const db = await getDb();
      const syncState = await db.get("syncStates", peerId);
      console.groupCollapsed("[pers/idb] load sync state for", peerId, docId);
      console.log(syncState);
      console.groupEnd();
      if (!syncState || !(docId in syncState)) return;
      return syncState[docId] as BinarySyncState;
    },
    async saveSyncState(
      peerId: string,
      docId: string,
      d: BinarySyncState
    ): Promise<void> {
      const db = await getDb();
      const syncState = await db.get("syncStates", peerId);
      console.groupCollapsed("[pers/idb] save sync state for", peerId, docId);
      console.log(d);
      console.groupEnd();
      await db.put("syncStates", { ...syncState, [docId]: d }, peerId);
      return;
    },
  };
}
