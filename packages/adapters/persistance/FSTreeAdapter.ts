import { IFile, YNode } from "@notarium/types";
import detectMimeType from "@notarium/common/detectMime";

import * as Y from "yjs";

import { FSWatcher } from "./FSWatcher";

import { basename, resolve } from "path";
import { lstat, readdir, rm } from "fs/promises";
import {
  createEventEmitter,
  createMutexFactory,
  logger,
} from "@notarium/common";
import { Adapter, File, FileSystem } from "@notarium/fs";

const log = logger("adapt/fs-tree");

export async function readFile(path: string): Promise<IFile> {
  const stat = await lstat(path);

  if (stat.isDirectory()) {
    const fileNames = (await readdir(path)).filter((fileName) => {
      if (fileName.startsWith(".")) return false;
      return true;
    });

    const children = await Promise.all(
      fileNames.map((p) => readFile(path + "/" + p))
    );

    return {
      path: basename(path),
      mimetype: "dir",
      children,
    };
  } else {
    return {
      mimetype: await detectMimeType(path),
      path: basename(path),
    } as IFile;
  }
}

function syncFile(file: File, treeData: IFile) {
  file.update((doc: Y.Doc) => {
    const tree = doc.getMap("tree") as YNode;

    function syncAttributes(node: YNode, oNode?: IFile) {
      const path = node.get("path");
      const currentMime = node.get("mimetype");

      if (path !== oNode?.path) {
        node.set("path", oNode.path);
      }

      if (currentMime !== oNode.mimetype) {
        node.set("mimetype", oNode.mimetype);
      }

      let children = node.get("children");

      if (oNode.mimetype !== "dir") return;

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
  });
}

async function syncFsWithFile(rootPath: string, file: IFile, memFile: IFile) {
  if (file.mimetype === "dir" && memFile.mimetype === "dir") {
    for (const child of file.children) {
      const docChild = memFile.children.find((c) => c.path === child.path);

      if (!docChild) {
        log("delete", rootPath + "/" + child.path);

        const deletePath = rootPath + "/" + child.path;

        // await rm(deletePath);
      }

      return syncFsWithFile(rootPath + "/" + child.path, child, docChild);
    }
  }
}

export async function FSTreeAdapter(fs: FileSystem): Promise<Adapter> {
  const { rootPath = resolve(process.env.HOME, "Notes") } = fs;

  const { emit, on } = createEventEmitter();

  log("create new");

  const createMutex = createMutexFactory();

  async function saveDocument() {
    const finishTask = await createMutex("applyDocToFS");

    const fsdata = await readFile(rootPath);
    // const docdata = frontend.findNode("/");

    // syncFsWithFile(rootPath, fsdata, docdata);

    finishTask();
  }

  async function loadDocument() {
    syncFile(fs, data, id);
  }

  // const file = await fs.openFile("tree");
  // await file.load();

  const watcher = FSWatcher(rootPath);

  watcher.on("changes", async (changes) => {
    const finishTask = await createMutex("applyFsToDoc");

    backend.update(async () => {
      return;
      await Promise.all(
        changes.map(async (change) => {
          switch (change.type) {
            case "rename":
              frontend.renameNode(change.path, change.newPath, id);
              break;
            case "delete":
              frontend.deleteNode(change.path, id);
              break;
            case "add":
              if (change.isDirectory) {
                frontend.createNode(change.path, "dir", id);
              } else {
                frontend.createNode(change.path, change.mimetype, id);
              }
              break;
            case "unlink":
              frontend.deleteNode(change.path, id);
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
    on,
    async requestFile(f: File) {
      const data = await readFile(rootPath as string);

      f.getData().then((doc) => {});

      console.log("read tree", data);
    },
    async closeFile(f: File) {
      console.log("close tree", f);
    },
    async saveFile(f: File) {
      console.log("save tree", f);
    },
  };
}
