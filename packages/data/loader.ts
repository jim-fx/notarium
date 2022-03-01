import { IDataBackend, IDirectory, IFile, YNode } from "@notarium/types";
import { IDBAdapter, P2PClient } from "@notarium/adapters";
import { createDataBackend, createTree } from ".";

interface TempFile {
  path: string;
  file: IFile;
}

function flattenTree(t: IDirectory): string[] {
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

export function createLoader(b: IDataBackend) {
  let paths: string[] = [];

  const frontend = createTree(b);

  function update() {
    paths = flattenTree(frontend.findNode("/") as IDirectory);

    console.log(paths);

    paths.forEach((p) => {
      const b = createDataBackend(p, {
        persistanceAdapterFactory: IDBAdapter,
        messageAdapter: P2PClient,
      });
      b.load();
    });
  }

  b.doc.on("update", () => {
    update();
  });

  function load(cb: (data: { total: number; finished: number }) => void) {
    update();
    cb({ total: 10, finished: 5 });
  }

  return {
    load,
  };
}
