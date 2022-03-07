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
  corePromise.then((c) => {
    core = c;
  });

  log("open file", path);

  const file: File = {
    path,
    mimetype,
    mutex: createMutexFactory(),
    get isCRDT() {
      return mimeSupportsCRDT(file.mimetype);
    },
    getData() {
      if (!core) console.trace("FIle not yet loaded");
      return core.getData();
    },
    async getBinaryData() {
      const data = await (await corePromise).getData();
      if (!this.isCRDT) {
        return data as Uint8Array;
      }
      return encodeStateAsUpdateV2(data as Doc);
    },
    async read() {
      return (await corePromise).getData();
    },
    // this cant be called by adapters, only interfaces
    async update(cb, adapterSymbol) {
      const f = await this.mutex();
      const core = await corePromise;
      await core.update(cb, adapterSymbol);
      f();
      emitter.emit("update", await core.getData());
    },
    isLoaded: corePromise,
    load,
    on: emitter.on,
    close,
  };

  async function load() {
    if (core) return;

    log("loading", file);

    let data: Uint8Array;
    for (const a of fs.adapters) {
      const d = await a.requestFile(file);
      if (d) {
        data = d;
      }
    }

    setCore(
      file.isCRDT
        ? createCRDTCore(file, data, fs.adapters)
        : createBinaryCore(file, data, fs.adapters)
    );

    log("loaded", file);
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