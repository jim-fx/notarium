import { promises } from "fs";
import { basename } from "path";
import { homedir } from "os";
const { readdir, lstat } = promises;
import { ITreeAdapter, Tree, TreeData } from "@notarium/types";
import { BinarySyncState } from "automerge";

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
    async readDocument(docId: string, fsPath?: string) {
      if (docId === "tree") {
        console.log("fsAdapter::read", fsPath);
        _treeData = await readTreeData(fsPath);
        return _treeData;
      }
    },

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
