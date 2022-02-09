import {
  IDataBackend,
  IPersistanceAdapterFactory,
  TreeData,
  YNode,
} from "@notarium/types";

import * as Y from "yjs";

import { FSWatcher } from "./FSWatcher";
import { createTree } from "@notarium/data";

import { basename, resolve } from "path";
import { lstat, readdir, rm } from "fs/promises";
import { createMutexFactory } from "@notarium/common";

export async function readTreeData(path: string): Promise<TreeData> {
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

function syncTreeData(
  backend: IDataBackend<YNode>,
  treeData: TreeData,
  origin: Symbol
) {
  const tree = backend.doc.getMap("tree") as YNode;

  backend.update(() => {
    function syncAttributes(node: YNode, oNode?: TreeData) {
      if (!oNode) {
        console.log(node);
      }

      const path = node.get("path");

      if (path !== oNode?.path) {
        node.set("path", oNode.path);
      }

      let children = node.get("children");

      children?.forEach((n) => {
        const nodePath = n.get("path");
        if (nodePath) {
          const nIndex = oNode.children.findIndex((c) => c.path === nodePath);
          if (nIndex === -1) {
            const index = node
              .get("children")
              .toArray()
              .findIndex((v) => v === n);
            node.get("children").delete(index, 1);
            return;
          }

          const [nO] = oNode.children.splice(nIndex, 1);

          return syncAttributes(n, nO);
        }
      });

      if (oNode?.children?.length) {
        if (!children) {
          children = new Y.Array();
          node.set("children", children);
        }

        children.push(
          oNode.children.map((c) => {
            const m = new Y.Map() as YNode;
            syncAttributes(m, c);
            return m;
          })
        );
      }
    }

    syncAttributes(tree, treeData);
  }, origin);
}

async function syncFsWithTreeData(
  rootPath: string,
  treeData: TreeData,
  docTreeData: TreeData
) {
  if (docTreeData.children) {
  }

  if (treeData.children) {
    for (const child of treeData.children) {
      const docChild = docTreeData.children.find((c) => c.path === child.path);

      if (!docChild) {
        // "We need to delete it"
        console.log("delete", rootPath + "/" + child.path);

        const deletePath = rootPath + "/" + child.path;

        await rm(deletePath);
      }

      return syncFsWithTreeData(rootPath + "/" + child.path, child, docChild);
    }
  }
}

export const FSTreeAdapter: IPersistanceAdapterFactory<YNode> = (backend) => {
  const { ROOT_PATH = resolve(process.env.HOME, "Notes") } = backend?.flags;

  const id = Symbol();

  const createMutex = createMutexFactory();

  const frontend = createTree(backend);

  async function saveDocument() {
    const finishTask = await createMutex("applyDocToFS");

    const fsdata = await readTreeData(ROOT_PATH);
    const docdata = frontend.findNode("/");

    syncFsWithTreeData(ROOT_PATH, fsdata, docdata);

    finishTask();
  }

  async function loadDocument() {
    const data = await readTreeData(ROOT_PATH as string);
    syncTreeData(backend, data, id);
  }

  const watcher = FSWatcher(ROOT_PATH);

  watcher.on("changes", async (changes) => {
    const finishTask = await createMutex("applyFsToDoc");
    backend.update(async () => {
      await Promise.all(
        changes.map(async (change) => {
          switch (change.type) {
            case "rename":
              frontend.renameNode(change.path, change.newPath);
              break;
            case "delete":
              frontend.deleteNode(change.path);
              break;
            case "add":
              if (change.isDirectory) {
                frontend.createNode(change.path);
              } else {
                frontend.createNode(change.path, "");
              }
              break;
            case "unlink":
              frontend.deleteNode(change.path);
              break;
            default:
              break;
          }
        })
      );
    }, id);
    finishTask();
  });

  return {
    loadDocument,
    saveDocument,
  };
};
