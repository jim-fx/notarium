import { createCachedFactory, splitPath } from "@notarium/common";
import { createDocument } from "@notarium/data";
import { IPersistanceAdapterFactory } from "@notarium/types";
import { readFile, stat, writeFile, lstat } from "fs/promises";
import { resolve } from "path";

import { FSWatcher } from "./FSWatcher";

const _FSTextAdapter: IPersistanceAdapterFactory<string> = (backend) => {
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
    let s: Awaited<ReturnType<typeof stat>>;
    try {
      s = await stat(filePath);
    } catch (err) {
      // Into the void with you, YEEEET!
    }

    if (s) {
      if (!s.isFile()) return;
      console.groupCollapsed("[adapt/fs.text] readFile");
      console.log({ filePath });
      console.groupEnd();
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
};

export const FSTextAdapter = createCachedFactory(
  _FSTextAdapter,
  (b) => b.docId
);