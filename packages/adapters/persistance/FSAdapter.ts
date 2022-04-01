import { logger, splitPath } from "@notarium/common";
import { Adapter, File, FileSystem } from "@notarium/fs";
import { FSWatcher } from "./FSAdapter/Watcher";
import { FSTreeAdapter } from "./FSAdapter/TreeAdapter";
import { createDocumentFrontend } from "@notarium/data";
import detectMimeType from "@notarium/common/detectMime";
import { Doc } from "yjs";

const log = logger("adapt/fs");

log.isolate();

async function setTextFileContent(file: File, path: string) {
  const { readFile } = await import("node:fs/promises");

  await file.load();
  const content = await readFile(path, "utf8");

  const frontend = createDocumentFrontend(file);

  frontend.setText(content);
}

async function writeTextFile(f: File, filePath: string) {
  const { writeFile } = await import("node:fs/promises");
  const content = (f.getData() as Doc).getText("content").toString();
  log("save file", { content });
  await writeFile(filePath, content, "utf8");
}

export async function FSAdapter(fs: FileSystem): Promise<Adapter> {
  const { resolve } = await import("node:path");
  const { readFile, stat } = await import("node:fs/promises");

  const id = Symbol("adapt/fs");

  const { rootPath = resolve(process.env.HOME, "Notes") } = fs.flags;

  log("create new");

  const watcher = FSWatcher(rootPath);

  const tree = FSTreeAdapter(fs, id, rootPath);

  const files: Record<string, File> = {};

  watcher.on("changes", async (changes) => {
    tree.handleChanges(changes);

    changes.forEach(async (change) => {
      if (change.type !== "change") return;

      const changePath = splitPath(change.path).join("/");
      const file = files[changePath];
      const filePath = resolve(rootPath, changePath);

      if (file && file.mimetype.startsWith("text/")) {
        await setTextFileContent(file, filePath);
      } else {
        return readFile(filePath);
      }
    });
  });

  return {
    id,
    async requestFile(f: File) {
      if (f.path === "tree" || f.mimetype === "tree") {
        return tree.requestTree(f);
      }

      log("file open request", { path: f.path });

      files[f.path] = f;
      const filePath = resolve(rootPath, f.path);

      let s: Awaited<ReturnType<typeof stat>>;
      try {
        s = await stat(filePath);
      } catch (err) {
        return;
      }

      if (!s || !s.isFile()) return;

      const mimetype = await detectMimeType(filePath);

      if (mimetype !== "unknown") {
        f.mimetype = mimetype;
      }

      if (mimetype.startsWith("text/")) {
        setTextFileContent(f, filePath);
      } else {
        return readFile(filePath);
      }
    },
    async closeFile(f: File) {
      if (f.path !== "tree") return;
    },
    async saveFile(f: File) {
      if (f.path !== "tree") return;

      const filePath = resolve(rootPath, f.path);

      if (f.mimetype.startsWith("text/")) {
        return writeTextFile(f, filePath);
      } else {
        // TODO: implement binary file save
      }
    },
  };
}
