import { createMutexFactory, parseBinary } from "@notarium/common";
import {
  IDataBackend,
  IMessageAdapter,
  IPersistanceAdapter,
} from "@notarium/types";

import * as Y from "yjs";

const backends: Record<string, IDataBackend<any>> = {};

type PersitanceAdapterFactory<T> = (
  backend: IDataBackend<T>
) => IPersistanceAdapter;

interface DataBackendOptions<T> {
  persistanceAdapterFactory:
    | PersitanceAdapterFactory<T>
    | PersitanceAdapterFactory<T>[];
  messageAdapter: IMessageAdapter;
  flags?: { [key: string]: unknown; ROOT_PATH?: string };
}

let rootDoc: Y.Doc;

export function createDataBackend<T>(
  docId: string,
  { persistanceAdapterFactory, messageAdapter, flags }: DataBackendOptions<T>
): IDataBackend<T> {
  if (docId in backends) return backends[docId];
  if (!rootDoc) {
    rootDoc = new Y.Doc();
  }

  let doc = rootDoc.getMap().get(docId) as Y.Doc;
  if (!doc) {
    doc = new Y.Doc({ autoLoad: true });
    rootDoc.getMap().set(docId, doc);
  }

  const myId = messageAdapter.getId();

  const createMutex = createMutexFactory();

  const backend: IDataBackend<T> = {
    docId,
    load,
    update,
    close,
    doc,
    flags,
  };

  function update(cb: (arg: T) => void, origin?: string) {
    doc.transact(() => cb(doc as unknown as T), origin || docId);
  }

  const persist = (
    Array.isArray(persistanceAdapterFactory)
      ? persistanceAdapterFactory
      : [persistanceAdapterFactory]
  ).map((fac) => fac(backend));

  async function load() {
    update(async () => {
      for (const p of persist) {
        const updates = await p.loadDocument(docId);
        if (updates) {
          Y.applyUpdateV2(doc, updates);
        }
      }
      initNetwork();
    });
  }

  const listeners = [];
  const peerIds = new Set<string>();
  const docOpenType = "doc.open";
  const docUpdateType = "doc.update";
  const docCloseType = "doc.close";
  function initNetwork() {
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
      (peerId: string) => peerIds.delete(peerId),
      { listeners }
    );

    messageAdapter.on(
      "disconnect",
      (peerId: string) => peerIds.delete(peerId),
      { listeners }
    );
  }

  doc.on("update", (update: Uint8Array, origin: string) => {
    update = Y.convertUpdateFormatV1ToV2(update);
    messageAdapter.broadcast(docUpdateType, { updates: update.join(), docId });
    persist.forEach((p) => p.saveDocument(docId, Y.encodeStateAsUpdateV2(doc)));
  });

  function close() {
    doc.destroy();
  }

  backends[docId] = backend;

  return backend;
}
