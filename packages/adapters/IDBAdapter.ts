import { IDBPDatabase, openDB, deleteDB } from "idb";
import { IPersistanceAdapter } from "@notarium/types";
import { delayExecution } from "@notarium/common";

const getDb = (() => {
  let db: Promise<IDBPDatabase<unknown>>;
  return () => {
    if (db) return db;
    db = openDB("notarium", 1, {
      upgrade(db) {
        db.createObjectStore("documents");
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
const documents: Record<string, Uint8Array> = {};

export function IDBAdapter(): IPersistanceAdapter {
  const saveDocument = delayExecution(async (ids) => {
    const db = await getDb();
    ids.forEach(async (id) => {
      await db.put("documents", documents[id], id);
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
  };
}
