import {
  createResolvablePromise,
  groupArray,
  logger,
  wait,
} from "@notarium/common";
import { File } from ".";
import { createFile } from "./createFile";
import * as treeFrontend from "./treeFrontend";
import { AdapterFactory, FileSystem, FileSystemFlags } from "./types";

const log = logger("fs");

export function createFileSystem(
  adaptersFactories: AdapterFactory[],
  flags: FileSystemFlags
) {
  let isLoading = false;
  const [isLoaded, setLoaded] = createResolvablePromise();

  const openFiles: Map<string, File> = new Map();

  const fs: FileSystem = {
    isLoaded,
    flags,
    adapters: [],
    findFile(path: string) {
      return treeFrontend.findFile(this, path)?.toJSON();
    },
    listFiles() {
      return treeFrontend.listFiles(this);
    },
    renameFile(oldPath: string, newPath: string) {
      return treeFrontend.renameFile(this, oldPath, newPath);
    },
    isDir(path: string) {
      return treeFrontend.isDir(this, path);
    },
    createFile(path: string) {
      return treeFrontend.createFile(this, path, "text/markdown");
    },
    deleteFile(path: string) {
      return treeFrontend.deleteFile(this, path);
    },
    openFile(path: string) {
      if (openFiles.has(path)) return openFiles.get(path);
      const file = createFile(path, this);
      openFiles.set(path, file);
      return file;
    },
    async setOffline(o) {
      if (!o) return;
      await isLoaded;

      const allFiles = treeFrontend.findAllFiles(this);

      const groups = groupArray(allFiles, 5);

      let amount = allFiles.length;
      let done = 0;

      while (groups.length) {
        const g = groups.pop();
        console.log("Loading", g);
        await Promise.all(
          g.map(async (filePath) => {
            if (!filePath) return;
            const file = this.openFile(filePath);
            await file.load();
            done++;
          })
        );
        await wait(200);
        console.log(Math.floor((done / amount) * 1000) / 10 + "% loaded");
      }
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
