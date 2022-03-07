import { createEventEmitter, logger, splitPath } from "@notarium/common";
import detectMimeType from "@notarium/common/detectMime";
import { AdapterFactory, File, FileSystem } from "@notarium/fs";
import { readFile, stat, writeFile } from "fs/promises";
import { resolve } from "path";
import { createDocumentFrontend } from "../../data";

import { FSWatcher } from "./FSWatcher";

const log = logger("adapter/fs-text");

export const FSTextAdapter: AdapterFactory = (fs: FileSystem) => {
  const id = Symbol("adapt/text");

  const { rootPath = resolve(process.env.HOME, "Notes") } = fs.flags;
  const { on, emit } = createEventEmitter();

  const files: Record<string, File> = {};

  const watcher = FSWatcher(rootPath);

  watcher.on("changes", (changes) => {
    changes.forEach(async (change) => {
      const changePath = splitPath(change.path).join("/");
      const file = files[changePath];
      if (file && file.mimetype.startsWith("text/")) {
        await file.load();
        const content = await readFile(rootPath + "/" + changePath, "utf8");

        const frontend = file.stuff.frontend || createDocumentFrontend(file);
        file.stuff.frontend = frontend;

        frontend.setText(content);
      }
    });
  });

  return {
    id,
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

      if (!mimetype.startsWith("text/")) return;
      console.log(" load", { path: f.path, mimetype });

      if (s) {
        if (!s.isFile()) return;
        log("reading file", { filePath });
        f.mimetype = mimetype;
        f.isLoaded.then(async () => {
          const frontend = createDocumentFrontend(f);
          const content = await readFile(filePath, "utf8");
          frontend.setText(content);
        });
      }
    },
    async saveFile(f: File) {
      if (!f.mimetype.startsWith("text/")) return;
      const content = f.getData().getText("content").toString();
      console.log("save file", { content });
      const filePath = rootPath + "/" + f.path;
      await writeFile(filePath, content, "utf8");
    },
    async closeFile() {},
    on,
  };
};
