import {
  createCachedFactory,
  splitPath,
  logger,
  createEventEmitter,
} from "@notarium/common";
import { AdapterFactory, File, FileSystem } from "@notarium/fs";
import { IPersistanceAdapterFactory } from "@notarium/types";
import { readFile, stat, writeFile } from "fs/promises";
import { resolve } from "path";

import { FSWatcher } from "./FSWatcher";

const log = logger("adapter/fs-text");

export const FSFileAdapter: AdapterFactory = (fs: FileSystem) => {
  const watcher = FSWatcher(fs.rootPath);

  const { on, emit } = createEventEmitter();

  watcher.on("changes", (changes) => {
    changes.forEach(async (change) => {
      const changePath = splitPath(change.path).join("/");
      if (changePath === backend.docId) {
        const content = await readFile(filePath, "utf8");
        backend.update(content);
      }
    });
  });

  async function loadDocument() {}

  async function saveDocument() {
    const content = backend.doc;
    try {
      await writeFile(filePath, content, "binary");
    } catch (error) {
      log.error(error);
    }
  }

  return {
    async requestFile(f: File) {
      let s: Awaited<ReturnType<typeof stat>>;
      try {
        s = await stat(f.path);
      } catch (err) {
        return;
      }

      if (!s || !s.isFile()) return;
      log("reading file", { filePath });
      return await readFile(filePath);
    },
    saveFile(f: File) {},
    closeFile(f: File) {},
  };
};
