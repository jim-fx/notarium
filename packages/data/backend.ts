import { createMutexFactory, parseBinary } from "@notarium/common";
import {
  IDataBackend,
  IMessageAdapter,
  IPersistanceAdapter,
} from "@notarium/types";
import * as Y from "yjs";

globalThis["Y"] = Y;

const backends: Record<string, IDataBackend<any>> = {};

interface DataBackendOptions<T> {
  persistanceAdapterFactory(backend: IDataBackend<T>): IPersistanceAdapter;
  messageAdapter: IMessageAdapter;
  defaultDocumentValue?: unknown;
}

let rootDoc: Y.Doc;

export function createDataBackend<T>(
  docId: string,
  { persistanceAdapterFactory, messageAdapter }: DataBackendOptions<T>
): IDataBackend<T> {
  if (docId in backends) return backends[docId];

  if (!rootDoc) {
    rootDoc = new Y.Doc();
  }

  let doc = rootDoc.getMap().get(docId) as Y.Doc;
  if (!doc) {
    doc = new Y.Doc();
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
  };

  function update(cb: (arg: T) => void) {
    doc.transact(() => {
      cb(doc as unknown as T);
    }, docId);
  }

  const persistanceAdapter = persistanceAdapterFactory(backend);

  async function load() {
    const updates = await persistanceAdapter.loadDocument(docId);
    if (updates) {
      Y.applyUpdateV2(doc, updates);
    }
    doc.emit("load", [this]);
    initNetwork();
  }

  const listeners = [];
  const peerIds = new Set<string>();
  const docOpenType = docId + ".open";
  const docUpdateType = docId + ".update";
  const docCloseType = docId + ".close";
  function initNetwork() {
    // Say hello to all my peers;
    messageAdapter.broadcast(docOpenType, Y.encodeStateVector(doc).join());

    // Respond to open documents
    messageAdapter.on(
      docOpenType,
      async (rawStateVector: string, peerId: string) => {
        const finishTask = await createMutex("handleOpenDocument");

        const remoteStateVec = parseBinary(rawStateVector);

        const updates = Y.encodeStateAsUpdateV2(doc, remoteStateVec);
        console.log("sending updates", updates);

        messageAdapter.sendTo(peerId, docUpdateType, {
          updates: updates.join(),
        });

        finishTask();
      },
      { listeners }
    );

    // Respond to sync requests
    messageAdapter.on(
      docUpdateType,
      async ({ updates: rawSyncData }, peerId: string = "server") => {
        peerIds.add(peerId);
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
    messageAdapter.broadcast(docUpdateType, { updates: update.join() });
    persistanceAdapter.saveDocument(docId, Y.encodeStateAsUpdateV2(doc));
  });

  function close() {
    doc.destroy();
  }

  backends[docId] = backend;

  return backend;
}
