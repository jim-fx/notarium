import { findChild, splitPath } from "@notarium/common";
import { IDataBackend, TreeData } from "@notarium/types";
import { children } from "svelte/internal";
import * as Y from "yjs";

type YNode = Y.Map<string | Y.Array<YNode>>;
export function createTree(backend: IDataBackend<Y.Doc>) {
  const d = backend.doc.getMap("tree");
  globalThis["map"] = d;

  function findNode(path: string = "/") {
    if (path === "/") {
      return backend?.doc?.toJSON();
    }

    debugger;

    const p = splitPath(path);
    p.shift();

    let currentNode: TreeData | undefined = backend._doc;

    while (p.length) {
      const name = p.shift() as string;
      if (!currentNode) break;
      currentNode = findChild(currentNode, name);
    }

    return currentNode;
  }

  function createNode(path: string, content: string) {
    const p = splitPath(path);
    p.shift();
    console.log("create new ", path);
    backend.update((doc) => {
      let currentNode = doc;
      while (p.length) {
        const n = p.shift();
        if (p.length === 0 && n && currentNode) {
          if ("children" in currentNode) {
            currentNode?.children?.push({
              path: n,
            });
          } else {
            currentNode.children = [{ path: n }];
          }
          console.log(currentNode);
        } else {
          currentNode = findChild(currentNode, n as string) as any;
          if (!currentNode) break;
        }
      }
    });
  }

  function deleteNode(path: string) {
    const p = splitPath(path);
    // Disallow deleting of root dir
    if (!p.length) return;
    p.shift();

    backend.update((doc) => {
      let currentNode = doc.getMap("tree") as YNode;
      let currentIndex;

      for (let i = 0; i < p.length - 1; i++) {
        const currentPathSeg = p[i];

        if (currentNode.has("children")) {
          const children = currentNode.get("children") as Y.Array<YNode>;
          currentNode = undefined;
          currentIndex = undefined;
          let found: YNode;
          children.forEach((c, i) => {
            if (found) return;
            if (c.get("path") === currentPathSeg) {
              currentIndex = i;
              found = c;
            }
          });
          if (found) {
            currentNode = found;
          } else {
            console.log("error");
            break;
          }
        } else {
          console.log("error");
          break;
        }

        if (!currentNode) {
          continue;
        }
      }

      if (currentNode) {
        console.log("del: ", currentNode.get("path"), p[p.length - 1]);
        const children = currentNode.get("children") as Y.Array<YNode>;
        children.delete(currentIndex, 1);
      } else {
        console.log("error");
      }
    });
  }

  function setTree(treeData: TreeData) {
    backend.update((doc: Y.Doc) => {
      const tree = doc.getMap("tree") as YNode;

      debugger;

      function syncAttributes(node: YNode, oNode?: TreeData) {
        const path = node.get("path");
        if (path !== oNode?.path) {
          node.set("path", oNode.path);
        }

        let children = node.get("children") as Y.Array<YNode>;

        children?.forEach((n) => {
          const nodePath = n.get("path");
          if (nodePath) {
            const nIndex = oNode.children.findIndex((c) => c.path === nodePath);
            if (nIndex === -1) {
              return syncAttributes(n);
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

  return {
    deleteNode,
    findNode,
    createNode,
    setTree,
  };
}
