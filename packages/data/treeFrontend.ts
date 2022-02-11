import { createCachedFactory, splitPath } from "@notarium/common";
import { IDataBackend, TreeData, YNode } from "@notarium/types";
import * as Y from "yjs";

function findChild(node: YNode, name: string) {
  if (!node.has("children")) return;
  const children = node.get("children");
  return children?.toArray().find((c) => c.get("path") === name);
}

function findChildIndex(node: YNode, name: string) {
  if (!node.has("children")) return -1;

  const children = node.get("children") as Y.Array<YNode>;

  return children?.toArray().findIndex((c) => c.get("path") === name) ?? -1;
}

function deleteChild(node: YNode, name: string) {
  const index = findChildIndex(node, name);
  if (index === -1) return;
  const children = node.get("children");
  children.delete(index, 1);
}

export const createTree = createCachedFactory(_createTree, (b) => b.docId);
function _createTree(backend: IDataBackend<YNode>) {
  function getRootNode() {
    return backend.doc.getMap("tree") as YNode;
  }

  function split(s: string | string[]) {
    const p = splitPath(s);
    const rootFolderName = getRootNode().get("path");
    if (p[0] === rootFolderName) {
      p.shift();
    }
    return p;
  }

  function findNode(path: string | string[] = "/"): YNode {
    const rootNode = getRootNode();

    const p = split(path);

    if (p.length === 0) {
      return rootNode;
    }

    let currentNode = rootNode;

    while (p.length) {
      const name = p.shift() as string;
      if (!currentNode) break;
      currentNode = findChild(currentNode, name);
    }

    return currentNode;
  }

  function createNode(path: string, content: string | null, origin: Symbol) {
    const p = split(path);

    console.log("tree.frontend.create", p);

    const lastFileName = p.pop();

    backend.update(() => {
      const parentNode = findNode(p);

      if (parentNode) {
        const child = new Y.Map();
        child.set("path", lastFileName);
        if (!content) {
          child.set("children", new Y.Array());
        }

        const children = parentNode.get("children") as Y.Array<YNode>;

        children.push([child as YNode]);
      }
    }, origin);
  }

  function renameNode(path: string, newPath: string, origin: Symbol) {
    backend.update(() => {
      const op = split(path);
      const np = split(newPath);

      const oldNodeName = op.pop();
      const oldParent = findNode(op);

      const nodeToMove = findChild(oldParent, oldNodeName);

      const newNodeName = np.pop();
      const newParent = findNode(np);

      if (!oldParent || !newParent || !newNodeName) return;

      nodeToMove.set("path", newNodeName);

      if (newParent !== oldParent) {
        deleteChild(oldParent, oldNodeName);
        newParent.get("children").push([nodeToMove]);
      }
    }, origin);
  }

  function deleteNode(path: string, origin: Symbol) {
    const p = split(path);

    // Disallow deleting of root dir
    if (!p.length) return;

    const lastFileName = p.pop();

    backend.update(() => {
      const parentOfDelete = findNode(p);
      if (parentOfDelete) {
        deleteChild(parentOfDelete, lastFileName);
      } else {
        console.log("error");
      }
    }, origin);
  }

  function isDir(path: string) {
    return !!findNode(path)?.toJSON()?.children;
  }

  return {
    deleteNode,
    findNode: (path: string): TreeData | undefined => findNode(path)?.toJSON(),
    isDir,
    createNode,
    renameNode,
  };
}