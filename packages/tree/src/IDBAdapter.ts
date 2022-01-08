import { save } from "automerge";
import { IDBPDatabase, openDB } from "idb";

const getDb = (() => {
  let db: Promise<IDBPDatabase<unknown>>;

  return () => {
    window["clearDB"] =async () => {
      const _db = await db;
      _db.
    }
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

export function IDBAdapter(tree: Tree): ITreeAdapter {
  return {
    async read() {
      const db = await getDb();
      const res = await db.get("main", "tree");
      return res;
    },
    async write() {
      const db = await getDb();
      const obj = save(tree.getTree());
      db.put("main", obj, "tree");
    },
    deleteNode() {},
    createNode() {},
    async getPeerIds() {
      const db = await getDb();
      return db.getAllKeys("syncStates");
    },
    async readSyncData(peerId: string) {
      const db = await getDb();
      const syncState = await db.get("syncStates", peerId);
      return syncState;
    },
    async writeSyncData(peerId: string, d: any): Promise<void> {
      const db = await getDb();
      await db.put("syncStates", d, peerId);
    },
  };
}
