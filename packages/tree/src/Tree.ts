import { IDataBackend, TreeData } from "@notarium/types";

function splitPath(p: string) {
  return p.split("/").filter((v) => !!v.length);
}

function findChild(tree: TreeData, n: string) {
  return tree.children?.find((c) => c.path === n);
}

export function createTree(backend: IDataBackend<TreeData>) {
  function findNode(path: string = "/") {
    if (path === "/") {
      return backend?._doc;
    }

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
      let currentNode = doc;
      while (p.length) {
        const n = p.shift();
        const nextNode = findChild(currentNode, n as string);
        if (!currentNode) break;
        if (p.length === 0 && currentNode && nextNode) {
          const childIndex = currentNode.children?.indexOf(nextNode);
          if (typeof childIndex === "number" && childIndex !== -1) {
            currentNode.children?.deleteAt?.(childIndex);
          }
        } else {
          currentNode = nextNode as any;
        }
      }
    });
  }

  return {
    deleteNode,
    findNode,
    createNode,
  };
}
