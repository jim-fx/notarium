import { createFile } from "./createFile";
import { Adapter, AdapterFactory } from "./types";
import {
  createEventEmitter,
  createResolvablePromise,
  logger,
} from "@notarium/common";

const log = logger("fs");

export function createFileSystem(
  rootPath: string,
  adaptersFactories: AdapterFactory[]
) {
  const { on, emit } = createEventEmitter();

  const [isLoaded, setLoaded] = createResolvablePromise();

  const fs = {
    isLoaded,
    rootPath,
    on,
    adapters: [],
    tree: undefined,
    async getContext(path: string) {
      const config = createContext(path, this);
      await config.load();
      return config;
    },
    async openFile(path: string) {
      await isLoaded;
      return createFile(path, this);
    },
    async findFile(path: string) {},
    async renameFile(oldPath: string, newPath: string) {
      await isLoaded;
    },
    async createFile(path: string) {
      await isLoaded;
    },
    async deleteFile(path: string) {
      await isLoaded;
      console.log("delete file", path);
    },
    async load() {
      this.adapters = await Promise.all(
        adaptersFactories.map((fn) => fn(this))
      );

      this.tree = createFile("tree", this);
      await this.tree.load();
      setLoaded();
      log("loaded");
    },
  };

  return fs;
}
