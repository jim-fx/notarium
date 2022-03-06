import createBinaryCore from "./core/createBinaryCore";
import createCRDTCore from "./core/createCRDTCore";
import {
  createEventEmitter,
  createMutexFactory,
  createResolvablePromise,
  detectMimeFromPath,
  logger,
} from "@notarium/common";
import { Adapter, File, FileSystem } from "./types";
import { MimeType } from "@notarium/types";
import { Doc } from "yjs";

function mimeSupportsCRDT(s: MimeType) {
  const supported: MimeType[] = ["tree", "text/markdown"];

  return supported.includes(s);
}

interface DataCore {
  update(
    cb: (d: Doc | Uint8Array) => Promise<void> | void,
    originalAdapter?: Adapter
  ): Promise<void>;
  getData(): Promise<Doc | Uint8Array>;
  destroy(): void;
}

const log = logger("file");

export function createFile(path: string, fs: FileSystem) {
  const mimetype = detectMimeFromPath(path);

  const emitter = createEventEmitter();

  let isLoaded = false;
  const [corePromise, setCore] = createResolvablePromise<DataCore>();
  corePromise.then(() => {
    isLoaded = true;
  });

  const mutex = createMutexFactory();

  const file: File = {
    path,
    mimetype,
    get isCRDT() {
      return mimeSupportsCRDT(file.mimetype);
    },
    async getData() {
      return (await corePromise).getData();
    },
    async read() {
      return (await corePromise).getData();
    },
    // this cant be called by adapters, only interfaces
    async update(cb) {
      const f = await mutex();
      await (await corePromise).update(cb);
      f();
    },
    get isLoaded() {
      return isLoaded;
    },
    load,
    on: emitter.on,
    close,
  };

  async function load() {
    let data: unknown;
    for (const a of fs.adapters) {
      const d = await a.requestFile(file);
      if (d) {
        data = d;
      }
    }

    const core = file.isCRDT
      ? createCRDTCore(file, data, fs.adapters)
      : createBinaryCore(file, data, fs.adapters);

    setCore(core);

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
