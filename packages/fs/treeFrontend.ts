import { splitPath } from "@notarium/common";
import { MimeType, YNode } from "@notarium/types";
import { Doc, Array } from "yjs";

import { FileSystem } from "./types";

function findChild(node: YNode, name: string) {
  if (!node.has("children")) return;
  const children = node.get("children");
  return children?.toArray().find((c: YNode) => c.get("path") === name);
}

function findChildIndex(node: YNode, name: string) {
  if (node.get("mimetype") !== "dir") return -1;

  const children = node.get("children") as Array<YNode>;

  return children?.toArray().findIndex((c) => c.get("path") === name) ?? -1;
}

function deleteChild(node: YNode, name: string) {
  const index = findChildIndex(node, name);
  if (index === -1) return;
  const children = node.get("children");
  children.delete(index, 1);
}

function getRootNode(fs: FileSystem) {
  return (fs.openFile("tree").getData() as Doc).getMap("tree") as YNode;
}

function split(fs: FileSystem, s: string | string[]) {
  const p = splitPath(s);
  const rootFolderName = getRootNode(fs).get("path");
  if (p[0] === rootFolderName) {
    p.shift();
  }
  return p;
}

export function findFile(fs: FileSystem, path: string | string[] = "/"): YNode {
  const rootNode = getRootNode(fs);

  const p = split(fs, path);

  if (p.length === 0) {
    return rootNode;
  }

  let currentNode = rootNode;

  while (p.length) {
    const name = p.shift() as string;
    if (!currentNode) {
      break;
    }
    currentNode = findChild(currentNode, name);
  }
  return currentNode;
}

export function createFile(fs: FileSystem, path: string, mimetype: MimeType) {
  const p = split(fs, path);

  const lastFileName = p.pop();

  backend.update(() => {
    const parentNode = findFile(fs, p);

    if (parentNode && parentNode.get("mimetype") === "dir") {
      const child = new Y.Map();
      child.set("path", lastFileName);
      child.set("mimetype", mimetype);
      if (mimetype === "dir") {
        child.set("children", new Y.Array());
      }

      const children = parentNode.get("children") as Y.Array<YNode>;

      children.push([child as YNode]);
    }
  }, origin);
}

export function findAllFiles(fs: FileSystem) {
  const t = getRootNode(fs).toJSON() as IDirectory;

  let currentChildren: TempFile[] = t.children.map((c) => {
    return {
      path: c.path,
      file: c,
    };
  });

  const output: string[] = [];

  while (currentChildren.length) {
    const cu = currentChildren.shift();
    if ("children" in cu.file) {
      currentChildren.push(
        ...cu.file.children.map((c) => {
          return {
            path: cu.path + "/" + c.path,
            file: c,
          };
        })
      );
    } else {
      output.push(cu.path);
    }
  }

  return output;
}

export function renameFile(fs: FileSystem, path: string, newPath: string) {
  backend.update(() => {
    const op = split(fs, path);
    const np = split(fs, newPath);

    const oldNodeName = op.pop();
    const oldParent = findFile(fs, op);

    const nodeToMove = findChild(oldParent, oldNodeName);

    const newNodeName = np.pop();
    const newParent = findFile(fs, np);

    if (!oldParent || !newParent || !newNodeName) return;

    nodeToMove.set("path", newNodeName);

    if (newParent !== oldParent) {
      deleteChild(oldParent, oldNodeName);
      newParent.get("children").push([nodeToMove]);
    }
  }, origin);
}

export function deleteFile(fs: FileSystem, path: string) {
  const p = split(fs, path);

  // Disallow deleting of root dir
  if (!p.length) return;

  const lastFileName = p.pop();

  backend.update(() => {
    const parentOfDelete = findFile(fs, p);
    if (parentOfDelete) {
      deleteChild(parentOfDelete, lastFileName);
    } else {
      console.log("error");
    }
  }, origin);
}

export function isDir(fs: FileSystem, path: string) {
  return !!findFile(fs, path)?.toJSON()?.children;
}
