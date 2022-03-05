import {
  createCachedFactory,
  createEventListener,
  createResolvablePromise,
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
  return [...splitPath(rawPath), "index.md"].map((_, i, a) => {
    return [...a.slice(0, i), "index.md"].join("/");
  });
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
        updateConfig();
      }
      backend.doc.on("update", listener);

      return r;
    });

    Promise.all(
      backends.map((b) => {
        b.backend.load();
        b.listener();
      })
    ).then(() => {
      backends.forEach((b) => b.listener());
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
    get() {
      return JSON.parse(JSON.stringify(config));
    },
    isLoaded,
    on,
  };
}
