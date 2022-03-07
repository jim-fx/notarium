import { createFile } from "./createFile";
import { AdapterFactory, FileSystem, FileSystemFlags } from "./types";
import {
  createEventEmitter,
  createResolvablePromise,
  logger,
} from "@notarium/common";

import * as treeFrontend from "./treeFrontend";

const log = logger("fs");

export function createFileSystem(
  adaptersFactories: AdapterFactory[],
  flags: FileSystemFlags
) {
  let isLoading = false;
  const [isLoaded, setLoaded] = createResolvablePromise();

  const cache = {};

  const fs: FileSystem = {
    isLoaded,
    flags,
    adapters: [],
    findFile(path: string) {
      return treeFrontend.findFile(this, path)?.toJSON();
    },
    renameFile(oldPath: string, newPath: string) {
      return treeFrontend.renameFile(this, oldPath, newPath);
    },
    openFile(path: string) {
      if (path in cache) return cache[path];
      cache[path] = createFile(path, this);
      return cache[path];
    },
    async load() {
      if (isLoading) return isLoaded;
      isLoading = true;

      this.adapters = await Promise.all(
        adaptersFactories.map(async (fn) => {
          return fn(this);
        })
      );

      const tree = this.openFile("tree");
      await tree.load();

      setLoaded();
      log("loaded");
    },
  };

  return fs;
}
