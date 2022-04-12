import { createMutexFactory, createResolvablePromise, logger, splitPath, wait } from "@notarium/common";
import detectMimeType from "@notarium/common/detectMime";
import { createDocumentFrontend } from "@notarium/data";
import { Adapter, File, FileSystem } from "@notarium/fs";
import { Doc } from "yjs";
import { FSTreeAdapter } from "./FSAdapter/TreeAdapter";
import { FSWatcher } from "./FSAdapter/Watcher";

const log = logger("adapt/fs");

log.isolate();

const lastWrites: Map<string, number> = new Map();

const mutex = createMutexFactory();

async function setTextFileContent(file: File, filePath: string) {

  const f = await mutex();

  const { readFile } = await import("fs/promises");


  await file.load();
  const content = await readFile(filePath, "utf8");


  if (content.length === 0) {
    console.log("HOUSTON:", { content });
  } else {
    const frontend = createDocumentFrontend(file);
    frontend.setText(content);
  }
  f();
}

async function writeTextFile(file: File, filePath: string) {
  const f = await mutex();
  const { writeFile } = await import("node:fs/promises");
  const content = (file.getData() as Doc).getText("content").toString();
  log("save file", { content });
  await writeFile(filePath, content, "utf8");
  lastWrites.set(filePath, performance.now());
  f();
}

export async function FSAdapter(fs: FileSystem): Promise<Adapter> {
  const { resolve } = await import("node:path");
  const { readFile, stat } = await import("fs/promises");

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

        const content = file.getData().getText("content").toString();
        await wait(200);
        const newContent = file.getData().getText("content").toString();

        if (content == newContent) {
          setTextFileContent(file, filePath);
        }


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
      if (f.path === "tree") {
        return;
      }

      const filePath = resolve(rootPath, f.path);

      if (f.mimetype.startsWith("text/")) {
        return writeTextFile(f, filePath);
      } else {
        // TODO: implement binary file save
        console.warn("TODO: implement binary file save");
      }
    },
  };
}
