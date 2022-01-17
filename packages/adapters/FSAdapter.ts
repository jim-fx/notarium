import { promises } from "fs";
import { basename } from "path";
const { readdir, lstat } = promises;
import { IDataBackend, IPersistanceAdapter, TreeData } from "@notarium/types";
import type { BinaryDocument, BinarySyncState, SyncState } from "automerge";
import Database from "sqlite-async";

const dbPromise = Database.open("./db.sql")
  .then(async (db) => {
    const res = await Promise.all([
      db.run(
        `CREATE TABLE IF NOT EXISTS syncStates(
            id integer PRIMARY KEY,
            peerId text NOT NULL, 
            docId text NOT NULL, 
            state text)
          `
      ),
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

async function readTreeData(path: string): Promise<TreeData> {
  const stat = await lstat(path);

  if (stat.isDirectory()) {
    const fileNames = (await readdir(path)).filter((fileName) => {
      if (fileName.startsWith(".")) return false;
      return true;
    });

    const children = await Promise.all(
      fileNames.map((p) => readTreeData(path + "/" + p))
    );

    return {
      path: basename(path),
      children,
    };
  } else {
    return {
      path: basename(path),
    };
  }
}

async function readDocFromDB(docId: string) {
  return (await dbPromise).get("SELECT * from documents WHERE docId = ?", [
    docId,
  ]);
}

function parseBinary(s: string) {
  return Uint8Array.from(s.split(",").map((v) => parseInt(v)));
}

export function FSAdapter<T = TreeData>(
  backend: IDataBackend<T>
): IPersistanceAdapter<T> {
  const syncStates = {};

  return {
    async saveDocument(docId: string, doc: BinaryDocument) {
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
    async loadDocument(docId: string, fsPath: string) {
      let doc = await readDocFromDB(docId);
      if (!doc && docId === "tree") {
        return await readTreeData(fsPath);
      }

      console.log("[pers/sql] read doc", docId, "from db");
      if (doc?.content) return parseBinary(doc.content) as BinaryDocument;
      return;
    },

    async loadSyncState(peerId: string, docId: string) {
      const v = await (
        await dbPromise
      ).get("SELECT * from syncStates WHERE peerId = ? AND docId = ?", [
        peerId,
        docId,
      ]);

      if (v?.state) {
        const data = JSON.parse(v.state) as SyncState;

        if (data.theirHave) {
          console.log(data.theirHave);
          debugger;
          data.theirHave = data.theirHave.map((v) => {
            return {
              ...v,
              bloom: v?.bloom?.length ? parseBinary(v.bloom) : new Uint8Array(),
            };
          });
        }

        debugger;
        console.groupCollapsed("[pers/sql] load sync state for", peerId, docId);
        console.log(data);
        console.groupEnd();
        return data;
      }

      return;
    },
    async saveSyncState(
      peerId: string,
      docId: string,
      d: SyncState
    ): Promise<void> {
      const db = await dbPromise;

      debugger;

      if (d.theirHave) {
        d = {
          ...d,
          theirHave: d?.theirHave?.map((v) => {
            return {
              ...v,
              bloom: v?.bloom?.toString(),
            };
          }),
        };
      }

      debugger;

      const state = JSON.stringify(d);

      const updateResult = await db.run(
        `UPDATE OR IGNORE syncStates 
         SET state = ? 
         WHERE docId = ? AND peerId = ?;`,
        [state, docId, peerId]
      );

      if (updateResult.changes === 0) {
        return (await dbPromise)
          .run(
            "INSERT OR IGNORE INTO syncStates(peerId, docId, state) VALUES(?,?,?)",
            [peerId, docId, state]
          )
          .then((res) => {
            console.groupCollapsed(
              "[pers/sql] save sync state for",
              peerId,
              docId
            );
            console.log(d);
            console.log(res);
            console.groupEnd();
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
  };
}
