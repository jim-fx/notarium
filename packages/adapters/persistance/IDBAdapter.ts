import { IDBPDatabase, openDB } from "idb";
import { delayExecution, logger } from "@notarium/common";
import type { FileSystem, AdapterFactory, File } from "@notarium/fs";

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

const files: Record<string, File> = {};

const log = logger("adapt/idb");

export const IDBAdapter: AdapterFactory = (fs: FileSystem) => {
  const saveDocument = delayExecution(async (ids) => {
    const db = await getDb();
    ids.forEach(async (id) => {
      await db.put("documents", files[id].getData(), id);
    });
  }, 2000);

  return {
    on() {},
    async saveFile(f: File) {
      files[f.path] = f;
      saveDocument(f.path);
    },
    async requestFile(f: File) {
      files[f.path] = f;
      log("loaded document ", { path: f.path });
      return await (await getDb()).get("documents", f.path);
    },
    async closeFile(f: File) {
      console.log("close", f);
    },
  };
};
