import { promises } from "fs";
import { basename } from "path";
const { readdir, lstat } = promises;
import { ITreeAdapter, TreeData } from "@notarium/types";
import type { BinarySyncState } from "automerge";
import Database from "sqlite-async";

const dbPromise = Database.open("./db.sql")
  .then(async (db) => {
    await Promise.all([
      db.run("CREATE TABLE IF NOT EXISTS syncStates(peerId text, state text)"),
      db.run("CREATE TABLE IF NOT EXISTS documents(docId text, state text)"),
    ]);
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

const syncData: Record<string, BinarySyncState> = {};
let tree;

async function writeTreeToDB(content: string) {
  const db = await dbPromise;

  const t = await readTreeFromDB();

  if (t) {
    await db.run("UPDATE documents SET state = ? WHERE docId = ?", [
      content,
      "tree",
    ]);
  } else {
    await db.run(
      `INSERT INTO documents(docId, state) VALUES(?,?)`,
      ["tree", content],
      function (err) {
        if (err) {
          return console.log(err.message);
        } else {
          // get the last insert id
          console.log(`A row has been inserted with rowid ${this.lastID}`);
        }
      }
    );
  }
}

async function readTreeFromDB() {
  return (await dbPromise).get("SELECT * from documents WHERE docId = ?", [
    "tree",
  ]);
}

export function FSAdapter(): ITreeAdapter {
  let _treeData: TreeData;

  return {
    deleteNode(path: string) {
      console.log("delete node", path);
    },
    createNode(path: string, defaultContent?: string) {
      console.log("create node", path);
    },

    writeDocument() {},

    async readTree(fsPath: string) {
      const t = await readTreeFromDB();
      if (t?.state)
        return Uint8Array.from(t?.state.split(",").map((v) => parseInt(v)));
      console.log("fsAdapter::read", fsPath);
      _treeData = await readTreeData(fsPath);
      return _treeData;
    },

    async writeTree(t, bin) {
      tree = t;
      writeTreeToDB(bin.toString());
    },

    async readDocument(docId: string) {},

    async getPeerIds() {
      return Object.keys(syncData);
    },
    async readSyncState(peerId: string) {
      return syncData[peerId];
    },
    async writeSyncState(peerId: string, d: BinarySyncState): Promise<void> {
      syncData[peerId] = d;
    },
  };
}
