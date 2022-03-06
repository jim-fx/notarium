import { IDataBackend, IDirectory, IFile, YNode } from "@notarium/types";
import { IDBAdapter, P2PClient } from "@notarium/adapters";
import { createTree } from ".";

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
