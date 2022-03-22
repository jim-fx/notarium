import {
  createEventEmitter,
  createResolvablePromise,
  logger,
  mergeObjects,
  splitPath,
} from "@notarium/common";
import { createDocumentFrontend } from "@notarium/data";
import { parseFrontmatter } from "@notarium/parser";
import type { File, FileSystem } from "./types";

const log = logger("fs/context");

log.disable();

function getPossiblePaths(rawPath: string) {
  return [...splitPath(rawPath), "index.md"]
    .map((_, i, a) => {
      return [...a.slice(0, i), "index.md"].join("/");
    })
    .filter((p) => p !== rawPath);
}

export function createContext(fs: FileSystem, file: File) {
  log("new", { path: file.path });

  const tree = fs.openFile("tree");

  const { on, emit } = createEventEmitter();

  let parentContextFile: File;

  let frontmatter = {};
  let parentContext = {};
  let context = {};
  let oldContext = JSON.stringify(context);

  let [isLoaded, setLoaded] = createResolvablePromise<void>();

  async function updateParentContext() {
    if (parentContextFile) {
      await parentContextFile.context.isLoaded;

      parentContext = parentContextFile.context.get();
    }

    updateMyContext();
  }

  async function updateMyContext() {
    await file.isLoaded;

    if (file.isCRDT) {
      const frontend = createDocumentFrontend(file);

      frontmatter = parseFrontmatter(frontend.getText());
    } else {
      frontmatter = {};
    }

    context = mergeObjects(parentContext, frontmatter);

    const newContext = JSON.stringify(context);

    if (oldContext !== newContext) {
      oldContext = newContext;
      emit("context", context);
    }

    setLoaded();
  }

  async function setParentFile(f: File) {
    if (parentContextFile && parentContextFile !== f) {
      // TODO: unsubscribe from all listeners
    }

    parentContextFile = f;

    if (parentContextFile) {
      parentContextFile.on("context", () => updateParentContext());
    }

    updateParentContext();
  }

  function updatePossiblePaths() {
    const possiblePaths = getPossiblePaths(file.path);

    const parentPath = possiblePaths.reverse().find((p) => {
      if (!fs.findFile(p)) return false;
      if (fs.isDir(p)) return false;
      const f = fs.openFile(p);
      console.log(f);
      if (!f.isCRDT) return false;
      return true;
    });

    if (parentPath) {
      const parentFile = fs.openFile(parentPath);
      parentFile.load();
      setParentFile(parentFile);
    } else {
      setParentFile(null);
    }
  }

  Promise.all([tree.isLoaded, file.isLoaded]).then(() => {
    updatePossiblePaths();
    // TODO: Need to somehow remove all the event listeners when the file gets destroyed
    file.on("update", () => updateMyContext());
    tree.on("update", () => updatePossiblePaths());
  });

  return {
    on,
    get() {
      return JSON.parse(JSON.stringify(context));
    },
    isLoaded,
  };
}
