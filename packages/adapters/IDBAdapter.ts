import { IDBPDatabase, openDB } from "idb";
import { ITreeAdapter } from "@notarium/types";

const getDb = (() => {
  let db: Promise<IDBPDatabase<unknown>>;

  return () => {
    if (db) return db;
    db = openDB("notarium", 1, {
      upgrade(db) {
        db.createObjectStore("main");
        db.createObjectStore("syncStates");
      },
    });
    return db;
  };
})();

export function IDBAdapter(): ITreeAdapter {
  return {
    async readTree() {
      const db = await getDb();
      const res = await db.get("main", "tree");
      return res;
    },
    deleteNode() {},
    createNode() {},
    readDocument() {},
    writeDocument() {},
    async getPeerIds() {
      const db = await getDb();
      return db.getAllKeys("syncStates") as Promise<string[]>;
    },
    async readSyncData(peerId: string) {
      const db = await getDb();
      const syncState = await db.get("syncStates", peerId);
      return syncState;
    },
    async writeSyncData(peerId: string, d: any): Promise<void> {
      const db = await getDb();
      await db.put("syncStates", d, peerId);
      return;
    },
  };
}
