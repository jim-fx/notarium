import { promises } from "fs";
import { basename } from "path";
import { homedir } from "os";
const { readdir, lstat } = promises;
import { ITreeAdapter, Tree, TreeData } from "@notarium/types";

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

const syncData: Record<string, unknown> = {};

export function FSAdapter(): ITreeAdapter {
  let _treeData: TreeData;

  return {
    readTree: async (path: string = homedir() + "/Notes") => {
      console.log("fsAdapter::read", path);
      _treeData = await readTreeData(path);
      return _treeData;
    },

    deleteNode(path: string) {},
    createNode(path: string, defaultContent?: string) {},

    writeDocument() {},
    readDocument() {},

    async getPeerIds() {
      return Object.keys(syncData);
    },
    async readSyncData(peerId: string) {
      return syncData[peerId];
    },
    async writeSyncData(peerId: string, d: unknown): Promise<void> {
      syncData[peerId] = d;
    },
  };
}
