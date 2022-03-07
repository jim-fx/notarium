import {
  createCachedFactory,
  splitPath,
  logger,
  createEventEmitter,
} from "@notarium/common";
import detectMimeType from "@notarium/common/detectMime";
import { AdapterFactory, File, FileSystem } from "@notarium/fs";
import { readFile, stat, writeFile } from "fs/promises";
import { resolve } from "path";
import { FSWatcher } from "./FSWatcher";

const log = logger("adapter/fs-text");

export const FSFileAdapter: AdapterFactory = (fs: FileSystem) => {
  const { rootPath = resolve(process.env.HOME, "Notes") } = fs.flags;

  const watcher = FSWatcher(rootPath);

  const id = Symbol("adapt/file");

  const { on, emit } = createEventEmitter();

  const files: Record<string, File> = {};

  watcher.on("changes", (changes) => {
    changes.forEach(async (change) => {
      // const changePath = splitPath(change.path).join("/");
      // if (changePath === backend.docId) {
      //   const content = await readFile(filePath, "utf8");
      //   backend.update(content);
      // }
    });
  });

  return {
    id,
    on,
    async requestFile(f: File) {
      files[f.path] = f;
      const filePath = rootPath + "/" + f.path;
      let s: Awaited<ReturnType<typeof stat>>;
      try {
        s = await stat(filePath);
      } catch (err) {
        return;
      }

      const mimetype = await detectMimeType(filePath);

      if (!mimetype.startsWith("image/")) return;
      if (!s || !s.isFile()) return;
      console.log("READING", filePath);
      f.mimetype = mimetype;
      return readFile(filePath);
    },
    async saveFile(f: File) {
      console.log("save", f);
    },
    async closeFile(f: File) {
      console.log("close", f);
    },
  };
};
