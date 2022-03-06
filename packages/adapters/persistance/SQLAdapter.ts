import type { AdapterFactory, FileSystem, File } from "@notarium/fs";

import Database from "sqlite-async";

const dbPromise = Database.open("./db.sql")
  .then(async (db) => {
    const res = await Promise.all([
      db.run(
        "CREATE TABLE IF NOT EXISTS documents(docId text PRIMARY KEY, content text)"
      ),
    ]);
    console.log("[fs] sqlite initialized", res);
    return db;
  })
  .catch((err: Error) => {
    console.error(err);
  });

async function readDocFromDB(docId: string) {
  return (await dbPromise).get("SELECT * from documents WHERE docId = ?", [
    docId,
  ]);
}

function parseBinary(s: string) {
  return Uint8Array.from(s.split(",").map((v) => parseInt(v)));
}

export const SQLAdapter: AdapterFactory = (fs: FileSystem) => {
  return {
    on() {},
    async writeFile(f: File) {
      const db = await dbPromise;
      console.log("[pers/sql] save document state", f.path);

      const content = (await f.getData()).toString();

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
            console.log("[pers/sql] saved doc", f.path, "to db");
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
    async requestFile(f: File) {
      let doc = await readDocFromDB(f.path);
      console.log("[pers/sql] read doc", f.path, "from db");
      if (doc?.content) return parseBinary(doc.content) as Uint8Array;
      return;
    },
  };
};
