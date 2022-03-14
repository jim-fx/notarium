import { logger } from "@notarium/common";
import type { AdapterFactory, FileSystem, File } from "@notarium/fs";

import Database from "sqlite-async";

const log = logger("adapt/sql");

const dbPromise = Database.open("./db.sql")
  .then(async (db) => {
    const res = await Promise.all([
      db.run(
        "CREATE TABLE IF NOT EXISTS documents(docId text PRIMARY KEY, content text)"
      ),
    ]);
    log("sqlite initialized", res);
    return db;
  })
  .catch((err: Error) => {
    log.error(err);
  });

async function readDocFromDB(docId: string) {
  return (await dbPromise).get("SELECT * from documents WHERE docId = ?", [
    docId,
  ]);
}

function parseBinary(s: string) {
  return Uint8Array.from(s.split(",").map((v) => parseInt(v)));
}

function toArrayBuffer(b: Buffer) {
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

export const SQLAdapter: AdapterFactory = () => {
  const id = Symbol("adapt/sql");

  return {
    id,
    on() {},
    async closeFile() {},
    async saveFile(f: File) {
      const db = await dbPromise;
      log("save document state", f.path);

      const content = (await f.getBinaryData()).toString();

      const updateResult = await db.run(
        `UPDATE OR IGNORE documents 
         SET content = ? 
         WHERE docId = ?;`,
        [content, f.path]
      );

      if (updateResult.changes === 0) {
        return (await dbPromise)
          .run("INSERT OR IGNORE INTO documents(docId, content) VALUES(?,?)", [
            f.path,
            content,
          ])
          .then((res) => {
            log("saved doc" + f.path + "to db");
          })
          .catch((err) => {
            log.error(err);
          });
      }
    },
    async requestFile(f: File) {
      let doc = await readDocFromDB(f.path);
      log("read doc " + f.path + " from db", doc);
      if (doc?.content) return parseBinary(doc.content) as Uint8Array;
      return;
    },
  };
};
