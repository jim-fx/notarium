import createBinaryCore from "./core/createBinaryCore";
import createCRDTCore from "./core/createCRDTCore";
import {
  createEventEmitter,
  createMutexFactory,
  createResolvablePromise,
  detectMimeFromPath,
  logger,
} from "@notarium/common";
import { DataCore, File, FileSystem } from "./types";
import type { MimeType } from "@notarium/types";
import { Doc, encodeStateAsUpdateV2 } from "yjs";
import { createContext } from "./createContext";

function mimeSupportsCRDT(s: MimeType) {
  const supported: MimeType[] = ["tree", "text/markdown"];
  return supported.includes(s);
}

const log = logger("file");

export function createFile(path: string, fs: FileSystem) {
  const mimetype = detectMimeFromPath(path);

  const emitter = createEventEmitter();

  let core: DataCore;
  const [corePromise, setCore] = createResolvablePromise<DataCore>();

  log("open file", path);

  const file: File = {
    path,
    mimetype,
    mutex: createMutexFactory(),
    get isCRDT() {
      return mimeSupportsCRDT(file.mimetype);
    },
    stuff: {},
    context: undefined,
    getData() {
      if (!core) console.trace("File not yet loaded");
      return core.getData();
    },
    async getBinaryData() {
      const data = (await corePromise).getData();
      if (!this.isCRDT) {
        return data as Uint8Array;
      }
      return encodeStateAsUpdateV2(data as Doc);
    },
    // this cant be called by adapters, only interfaces
    async update(cb, adapterSymbol) {
      const f = await this.mutex();
      const core = await corePromise;
      await core.update(cb, adapterSymbol);
      f();
      emitter.emit("update", core.getData());
    },
    isLoaded: corePromise,
    load,
    on: emitter.on,
    close,
  };

  async function load() {
    if (core) return;

    if (file.path !== "tree") {
      file.context = createContext(fs, file);
      file.context.on("context", () => {
        emitter.emit("context", file.context.get());
      });
    }

    log("loading", { path: file.path, mimetype: file.mimetype });

    let data: Uint8Array;
    for (const a of fs.adapters) {
      const d = await a.requestFile(file);
      if (d) {
        data = d;
      }
    }

    let c = file.isCRDT
      ? createCRDTCore(file, data, fs.adapters)
      : createBinaryCore(file, data, fs.adapters);

    core = c;
    setCore(c);

    log("loaded", { path: file.path, mimetype: file.mimetype });

    return c.getData();
  }

  async function close() {
    (await corePromise).destroy();
    for (const a of fs.adapters) {
      await a.closeFile(this);
    }
    emitter.emit("destroy");
  }

  return file;
}
