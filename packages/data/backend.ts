import {
  createMutexFactory,
  parseBinary,
  assureArray,
  createResolvablePromise,
  createCachedFactory,
  logger,
} from "@notarium/common";

import {
  IDataBackend,
  IMessageAdapter,
  IPersistanceAdapterFactory,
  MaybeArray,
} from "@notarium/types";

import * as Y from "yjs";

interface DataBackendOptions {
  persistanceAdapterFactory: MaybeArray<IPersistanceAdapterFactory>;
  messageAdapter?: IMessageAdapter;
  flags?: { [key: string]: unknown; ROOT_PATH?: string };
}

let rootDoc: Y.Doc;

const log = logger("backend");

export const createDataBackend = createCachedFactory(
  _createDataBackend
) as typeof _createDataBackend;

function _createDataBackend(
  docId: string,
  { persistanceAdapterFactory, messageAdapter, flags }: DataBackendOptions
): IDataBackend {
  let scope = this;

  log("create new backend", { docId });

  if (!rootDoc) {
    rootDoc = new Y.Doc({ autoLoad: true });
  }

  let doc = rootDoc.getMap().get(docId) as Y.Doc;
  if (!doc) {
    doc = new Y.Doc({ autoLoad: true });
    rootDoc.getMap().set(docId, doc);
  }

  const createMutex = createMutexFactory();

  const close = () => {
    log("destroyed", { docId });
    //doc.destroy();
    //scope?.destroy();
  };

  let isLoaded = false;
  const [isLoadedPromise, finishedLoading] = createResolvablePromise<void>();
  const backend: IDataBackend = {
    docId,
    load,
    update,
    close,
    doc,
    flags,
    isLoaded: isLoadedPromise,
    connect: messageAdapter?.connect,
  };

  async function update(
    cb: (arg: Y.Doc) => void | Promise<void>,
    origin?: Symbol
  ) {
    const finishTask = await createMutex("update");

    const [p, resolve] = createResolvablePromise<void>();

    doc.transact(async () => {
      await cb(doc);
      resolve();
    }, origin);

    await p;

    finishTask();
  }

  const persist = assureArray(persistanceAdapterFactory).map((createAdapter) =>
    createAdapter(backend)
  );

  doc.on("updateV2", (update: Uint8Array, origin: Symbol) => {
    messageAdapter?.broadcast(docUpdateType, { updates: update.join(), docId });
    const saveState = Y.encodeStateAsUpdateV2(doc);
    persist.forEach((p) => p.saveDocument(saveState, origin));
  });

  async function load() {
    if (isLoaded) return isLoadedPromise;
    isLoaded = true;
    update(async () => {
      for (const p of persist) {
        const updates = await p.loadDocument();
        if (updates) {
          Y.applyUpdateV2(doc, updates);
        }
      }
      initNetwork();
    });
    finishedLoading();
  }

  const listeners = [];
  const peerIds = new Set<string>();
  const docOpenType = "doc.open";
  const docUpdateType = "doc.update";
  const docCloseType = "doc.close";
  function initNetwork() {
    if (!messageAdapter) return;

    // Say hello to all my peers;
    messageAdapter.broadcast(docOpenType, {
      stateVector: Y.encodeStateVector(doc).join(),
      docId,
    });

    // Respond to open documents
    messageAdapter.on(
      docOpenType,
      async (
        { stateVector: rawStateVector, docId: remoteDocId },
        peerId: string
      ) => {
        if (remoteDocId !== docId) return;

        const finishTask = await createMutex("handleOpenDocument");

        const remoteStateVec = parseBinary(rawStateVector);

        const updates = Y.encodeStateAsUpdateV2(doc, remoteStateVec);

        messageAdapter.sendTo(peerId, docUpdateType, {
          updates: updates.join(),
          docId,
        });

        finishTask();
      },
      { listeners }
    );

    // Respond to sync requests
    messageAdapter.on(
      docUpdateType,
      async (
        { updates: rawSyncData, docId: remoteDocId },
        peerId: string = "server"
      ) => {
        peerIds.add(peerId);
        if (remoteDocId !== docId) return;
        if (!rawSyncData) return;

        const finishTask = await createMutex("handleSync");

        // Decode incoming stringified Uint8Array
        const updates = parseBinary(rawSyncData);

        log("received sync data", { peerId, docId });

        Y.applyUpdateV2(doc, updates, peerId);

        finishTask();
      },
      { listeners }
    );

    messageAdapter.on(
      docCloseType,
      ({ docId: remoteDocId }, peerId: string) => {
        if (docId === remoteDocId) {
          peerIds.delete(peerId);
        }
      },
      { listeners }
    );

    messageAdapter.on(
      "disconnect",
      (peerId: string) => peerIds.delete(peerId),
      { listeners }
    );
  }

  return backend;
}
