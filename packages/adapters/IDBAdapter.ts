import { IDBPDatabase, openDB, deleteDB } from "idb";
import {
  IPersistanceAdapter,
  IPersistanceAdapterFactory,
  YNode,
} from "@notarium/types";
import { createCachedFactory, delayExecution } from "@notarium/common";

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

const _IDBAdapter: IPersistanceAdapterFactory<string | YNode> = (backend) => {
  const saveDocument = delayExecution(async (ids) => {
    const db = await getDb();
    ids.forEach(async (id) => {
      await db.put("documents", documents[id], id);
    });
  }, 2000);

  const { docId } = backend;

  return {
    async loadDocument() {
      if (!documents[docId])
        documents[docId] = await (await getDb()).get("documents", docId);
      console.log("[pers.adapt/idb] loaded document " + docId);
      return documents[docId];
    },
    async saveDocument(content: Uint8Array) {
      documents[docId] = content;
      saveDocument(docId);
    },
  };
};

export const IDBAdapter = createCachedFactory(_IDBAdapter, (b) => b.docId);
