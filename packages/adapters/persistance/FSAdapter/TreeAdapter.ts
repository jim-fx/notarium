import { IFile, YNode } from "@notarium/types";
import detectMimeType from "@notarium/common/detectMime";

import * as Y from "yjs";

import { File, FileSystem } from "@notarium/fs";

export async function readTextFile(path: string): Promise<IFile> {
  const { lstat, readdir } = await import("node:fs/promises");
  const { basename } = await import("node:path");

  const stat = await lstat(path);

  if (stat.isDirectory()) {
    const fileNames = (await readdir(path)).filter((fileName) => {
      if (fileName.startsWith(".")) return false;
      return true;
    });

    const children = await Promise.all(
      fileNames.map((p) => readTextFile(path + "/" + p))
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

        console.log("delete file", deletePath);

        // await rm(deletePath);
      }

      return syncFsWithFile(rootPath + "/" + child.path, child, docChild);
    }
  }
}

export function FSTreeAdapter(
  fs: FileSystem,
  adapterId: Symbol,
  rootPath: string
) {
  return {
    async handleChanges(changes: any[]) {
      const file = fs.openFile("tree");

      await file.isLoaded;

      file.update(async () => {
        await Promise.all(
          changes.map(async (change) => {
            switch (change.type) {
              case "rename":
                fs.renameFile(change.path, change.newPath);
                break;
              case "delete":
                fs.deleteFile(change.path);
                break;
              case "add":
                if (change.isDirectory) {
                  fs.createFile(change.path, "dir");
                } else {
                  fs.createFile(change.path, change.mimetype);
                }
                break;
              case "unlink":
                fs.deleteFile(change.path);
                break;
              default:
                break;
            }
          })
        );
      }, adapterId);
    },
    async requestTree(f: File) {
      if (f.path !== "tree") return;

      const data = await readTextFile(rootPath as string);

      f.isLoaded.then(() => {
        syncFile(f, data);
      });
    },
  };
}
