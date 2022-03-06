import { splitPath, logger, createEventEmitter } from "@notarium/common";
import { AdapterFactory, FileSystem, File } from "@notarium/fs";
import { readFile, stat, writeFile } from "fs/promises";
import { resolve } from "path";

import { FSWatcher } from "./FSWatcher";

const log = logger("adapter/fs-text");

export const FSTextAdapter: AdapterFactory = (fs: FileSystem) => {
  const { rootPath = resolve(process.env.HOME, "Notes") } = fs;
  const { on, emit } = createEventEmitter();

  const watcher = FSWatcher(rootPath);

  watcher.on("changes", (changes) => {
    changes.forEach(async (change) => {
      // const changePath = splitPath(change.path).join("/");
      // const content = await readFile(filePath, "utf8");
      emit(changePath + ".change", "helloo");
    });
  });

  return {
    async requestFile(f: File) {
      const filePath = rootPath + "/" + f.path;
      let s: Awaited<ReturnType<typeof stat>>;
      try {
        s = await stat(filePath);
      } catch (err) {
        return;
      }

      if (s) {
        if (!s.isFile()) return;
        log("reading file", { filePath });
        const content = await readFile(filePath, "utf8");
        return content;
      } else {
        try {
          await writeFile(filePath, "", "utf8");
        } catch (error) {
          log.error(error);
        }
      }
    },
    async saveFile(f: File) {
      const content = await f.getData();
      console.log("save file", { f, content });
    },
    async closeFile() {},
    on,
  };
};
