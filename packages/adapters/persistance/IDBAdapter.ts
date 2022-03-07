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
  const id = Symbol("adapt/idb");

  const saveDocument = delayExecution(async (ids) => {
    const db = await getDb();
    ids.forEach(async (id) => {
      const file = files[id];
      let data = await file.getBinaryData();
      await db.put("documents", data, id);
    });
  }, 2000);

  return {
    id,
    on() {},
    async saveFile(f: File) {
      files[f.path] = f;
      saveDocument(f.path);
    },
    async requestFile(f: File) {
      files[f.path] = f;
      log("loading file " + f.path, f);
      return await (await getDb()).get("documents", f.path);
    },
    async closeFile(f: File) {
      console.log("close", f);
    },
  };
};
