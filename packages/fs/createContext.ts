import {
  createEventEmitter,
  createResolvablePromise,
  logger,
  mergeObjects,
  splitPath,
} from "@notarium/common";
import { parseFrontmatter } from "@notarium/parser";
import type { FileSystem, File } from "./types";

import { createDocumentFrontend } from "@notarium/data";

import { readable } from "svelte/store";

const log = logger("data/config");

function getAllPossibleConfigs(rawPath: string) {
  return [...splitPath(rawPath), "index.md"].map((_, i, a) => {
    return [...a.slice(0, i), "index.md"].join("/");
  });
}

function createConfigStore(b: ReturnType<typeof createConfig>) {
  return readable({}, (set) => {
    b.on("config", (c) => set(c));
  });
}

function createConfig(path: string, fs: FileSystem) {
  log("new", { path });

  const { on, emit } = createEventEmitter<{ config: any }>();

  const tree = fs.openFile("tree");

  let paths: string[] = [];

  let backends: {
    file: File;
    listener: () => unknown;
    frontmatter: any;
    frontend: ReturnType<typeof createDocumentFrontend>;
  }[] = [];
  const [isLoaded, setLoaded] = createResolvablePromise<boolean>();

  let config = {};
  async function updateConfig() {
    let _config = {};

    backends.forEach((b) => {
      if (b?.frontmatter) {
        _config = mergeObjects(_config, b.frontmatter);
      }
    });

    emit("config", _config);
    config = _config;
    setLoaded(true);
  }

  function updateBackendStores() {
    backends = paths.map((b) => {
      const file = fs.openFile(b);
      const frontend = createDocumentFrontend(file);

      const r = {
        file,
        listener,
        frontend,
        frontmatter: {},
      };

      function listener() {
        r.frontmatter = parseFrontmatter(frontend.getText());
        updateConfig();
      }
      file.on("update", listener);

      return r;
    });

    Promise.all(
      backends.map(async (b) => {
        await b.file.load();
        b.listener();
      })
    ).then(() => {
      backends.forEach((b) => b.listener());
      log("loaded", { path });
      updateConfig();
    });
  }

  function updatePossiblePaths() {
    paths = getAllPossibleConfigs(path).filter((p) => {
      if (!fs.findFile(p)) return false;
      if (!fs.isDir(p)) return false;
      return true;
    });

    updateBackendStores();
  }
  updatePossiblePaths();

  tree.on("update", () => updatePossiblePaths());

  return {
    get() {
      return JSON.parse(JSON.stringify(config));
    },
    isLoaded,
    on,
  };
}
