import { IPersistanceAdapter } from "@notarium/types";
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

export function SQLAdapter(): IPersistanceAdapter {
  return {
    async saveDocument(docId: string, doc: Uint8Array) {
      const db = await dbPromise;
      console.log("[pers/sql] save document state", docId);

      const content = doc.toString();

      const updateResult = await db.run(
        `UPDATE OR IGNORE documents 
         SET content = ? 
         WHERE docId = ?;`,
        [content, docId]
      );

      if (updateResult.changes === 0) {
        return (await dbPromise)
          .run("INSERT OR IGNORE INTO documents(docId, content) VALUES(?,?)", [
            docId,
            content,
          ])
          .then((res) => {
            console.log("[pers/sql] saved doc", docId, "to db");
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
    async loadDocument(docId: string) {
      let doc = await readDocFromDB(docId);
      console.log("[pers/sql] read doc", docId, "from db");
      if (doc?.content) return parseBinary(doc.content) as Uint8Array;
      return;
    },
  };
}
