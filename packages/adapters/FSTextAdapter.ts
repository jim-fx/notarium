import { IDataBackend, IPersistanceAdapter } from "@notarium/types";
import { resolve } from "path";
import { readFile, writeFile, stat } from "fs/promises";
import { createDocument } from "@notarium/data";
import { FSWatcher } from "./FSWatcher";
import { splitPath } from "@notarium/common";

export function FSTextAdapter(
  backend: IDataBackend<string>
): IPersistanceAdapter {
  const { ROOT_PATH = resolve(process.env.HOME, "Notes") } = backend?.flags;

  const frontend = createDocument(backend);

  const filePath = ROOT_PATH + "/" + backend.docId;

  const watcher = FSWatcher(ROOT_PATH);

  watcher.on("changes", (changes) => {
    changes.forEach(async (change) => {
      const changePath = splitPath(change.path).join("/");
      if (changePath === backend.docId) {
        const content = await readFile(filePath, "utf8");
        frontend.setText(content);
      }
    });
  });

  async function loadDocument() {
    let s;
    try {
      s = await stat(filePath);
    } catch (err) {
      // Into the void with you, YEEEET!
    }
    if (s) {
      const content = await readFile(filePath, "utf8");
      frontend.setText(content);
    } else {
      await writeFile(filePath, "", "utf8");
    }
  }

  async function saveDocument() {
    const content = frontend.getText();
    await writeFile(filePath, content, "utf8");
  }

  return {
    loadDocument,
    saveDocument,
  };
}
