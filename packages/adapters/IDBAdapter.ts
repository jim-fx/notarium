import { IDBPDatabase, openDB, deleteDB } from "idb";
import { ITreeAdapter, TreeData } from "@notarium/types";
import { BinaryDocument, FreezeObject, save } from "automerge";

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

if ("window" in globalThis) {
  window["clearDb"] = async () => {
    await deleteDB("notarium");
    console.log("cleared");
  };
}

export function IDBAdapter(): ITreeAdapter {
  return {
    async readTree() {
      const db = await getDb();
      const res = await db.get("main", "tree");
      return res;
    },
    async writeTree(tree: TreeData) {
      const db = await getDb();
      console.groupCollapsed("[adapt/idb] save document");
      console.log(tree);
      console.groupEnd();
      await db.put("main", save(tree), "tree");
      return;
    },
    deleteNode() {},
    createNode() {},
    readDocument() {},
    writeDocument() {},
    async getPeerIds() {
      const db = await getDb();
      return db.getAllKeys("syncStates") as Promise<string[]>;
    },
    async readSyncState(peerId: string) {
      const db = await getDb();
      const syncState = await db.get("syncStates", peerId);
      return syncState;
    },
    async writeSyncState(peerId: string, d: any): Promise<void> {
      const db = await getDb();
      await db.put("syncStates", d, peerId);
      return;
    },
  };
}
