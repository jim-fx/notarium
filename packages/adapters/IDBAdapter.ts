import { IDBPDatabase, openDB } from "idb";
import { IPersistanceAdapterFactory } from "@notarium/types";
import { createCachedFactory, delayExecution, logger } from "@notarium/common";

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

const documents: Record<string, Uint8Array> = {};

const log = logger("adapt/idb");

const _IDBAdapter: IPersistanceAdapterFactory = (backend) => {
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
      log("loaded document ", { docId });
      return documents[docId];
    },
    async saveDocument(content: Uint8Array) {
      documents[docId] = content;
      saveDocument(docId);
    },
  };
};

export const IDBAdapter = createCachedFactory(_IDBAdapter, (b) => b.docId);
