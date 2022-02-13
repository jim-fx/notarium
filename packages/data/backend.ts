import {
  createMutexFactory,
  parseBinary,
  assureArray,
  createResolvablePromise,
  createCachedFactory,
} from "@notarium/common";
import {
  IDataBackend,
  IMessageAdapter,
  IPersistanceAdapterFactory,
  MaybeArray,
} from "@notarium/types";

import * as Y from "yjs";

interface DataBackendOptions<T> {
  persistanceAdapterFactory: MaybeArray<IPersistanceAdapterFactory<T>>;
  messageAdapter?: IMessageAdapter;
  flags?: { [key: string]: unknown; ROOT_PATH?: string };
}

let rootDoc: Y.Doc;

export const createDataBackend = createCachedFactory(_createDataBackend);
export function _createDataBackend<T>(
  docId: string,
  { persistanceAdapterFactory, messageAdapter, flags }: DataBackendOptions<T>
): IDataBackend<T> {
  console.groupCollapsed("[dataBackend] create new backend");
  console.log({ docId });
  console.groupEnd();

  if (!rootDoc) {
    rootDoc = new Y.Doc();
  }

  let doc = rootDoc.getMap().get(docId) as Y.Doc;
  if (!doc) {
    doc = new Y.Doc({ autoLoad: true });
    rootDoc.getMap().set(docId, doc);
  }

  const createMutex = createMutexFactory();

  let isLoaded = false;
  const [isLoadedPromise, finishedLoading] = createResolvablePromise<void>();
  const backend: IDataBackend<T> = {
    docId,
    load,
    update,
    close,
    doc,
    flags,
    isLoaded: isLoadedPromise,
    connect: messageAdapter?.connect,
  };

  function update(cb: (arg: T) => void | Promise<void>, origin?: Symbol) {
    doc.transact(async () => {
      await cb(doc as unknown as T);
    }, origin);
  }

  const persist = assureArray(persistanceAdapterFactory).map((createAdapter) =>
    createAdapter(backend)
  );

  doc.on("update", (update: Uint8Array, origin: Symbol) => {
    console.log("AAAAABABBABBABBABABA");
    update = Y.convertUpdateFormatV1ToV2(update);
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

        console.groupCollapsed(
          "[backend] received sync data from",
          peerId,
          "for",
          docId
        );
        console.log(updates);
        console.groupEnd();

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

  function close() {
    doc.destroy();
  }

  return backend;
}
