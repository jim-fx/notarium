import {
  createCachedFactory,
  createEventListener,
  detectMimeFromPath,
  logger,
  mergeObjects,
  splitPath,
} from "@notarium/common";
import { parseFrontmatter } from "@notarium/parser";

import { createDataBackend } from "./backend";
import { createDocument } from "./documentFrontend";
import { createTree } from "./treeFrontend";

import type { IDataBackend } from "@notarium/types";
import { readable } from "svelte/store";

const log = logger("data/config");

function getAllPossibleConfigs(rawPath: string) {
  const possiblePaths: string[] = [];

  const mimeType = detectMimeFromPath(rawPath);

  const paths = splitPath(rawPath);

  const p = paths.map((_, i, a) => {
    return [...a.slice(0, i), "index.md"].join("/");
  });

  possiblePaths.push(...p);

  if (mimeType === "text/markdown" && !rawPath.endsWith("index.md")) {
    possiblePaths.push(rawPath);
    paths.pop();
  }

  return possiblePaths;
}

export const createConfigStore = createCachedFactory(_createConfigStore);
export const createConfig = createCachedFactory(_createConfig);

function _createConfigStore(b: ReturnType<typeof _createConfig>) {
  return readable({}, (set) => {
    b.on("config", (c) => set(c));
  });
}

function _createConfig(
  docId: string,
  { messageAdapter, persistanceAdapterFactory }
) {
  log("new", { docId });

  const { on, emit } = createEventListener<{ config: any }>();

  const treeStore = createDataBackend("tree", {
    messageAdapter,
    persistanceAdapterFactory,
  });

  const tree = createTree(treeStore);

  let paths: string[] = [];
  let backends: {
    backend: IDataBackend;
    listener: () => unknown;
    frontmatter: any;
    frontend: ReturnType<typeof createDocument>;
  }[] = [];

  async function updateConfig() {
    let config = {};

    backends.forEach((b) => {
      if (b?.frontmatter) {
        config = mergeObjects(config, b.frontmatter);
      }
    });

    emit("config", config);
  }

  function updateBackendStores() {
    // Unsubscribe old backends
    backends.forEach((b) => {
      b.backend.doc.off("update", b.listener);
    });

    backends = paths.map((b) => {
      const backend = createDataBackend(b, {
        messageAdapter,
        persistanceAdapterFactory,
      });
      const frontend = createDocument(backend);

      const r = {
        backend,
        listener,
        frontend,
        frontmatter: {},
      };

      function listener() {
        r.frontmatter = parseFrontmatter(frontend.getText());
        console.log(docId, r.frontmatter);
        updateConfig();
      }
      backend.doc.on("update", listener);

      return r;
    });

    Promise.all(
      backends.map((b) => {
        b.backend.load();
        return b.backend.isLoaded;
      })
    ).then(() => {
      log("loaded", { docId });
      updateConfig();
    });
  }

  function updatePossiblePaths() {
    paths = getAllPossibleConfigs(docId).filter((p) => {
      if (!tree.findNode(p)) return false;
      if (tree.isDir(p)) return false;
      return true;
    });

    updateBackendStores();
  }
  updatePossiblePaths();

  treeStore.doc.on("update", () => {
    updatePossiblePaths();
  });

  return {
    get docId() {
      return docId;
    },
    on,
  };
}
