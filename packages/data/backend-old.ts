import {
  IPersistanceAdapter,
  IMessageAdapter,
  IDataBackend,
  ISubscriber,
} from "@notarium/types";

import { parseBinary, createSerializer } from "@notarium/common";

import {
  BinaryDocument,
  BinarySyncMessage,
  BinarySyncState,
  change,
  FreezeObject,
  from,
  generateSyncMessage,
  init,
  initSyncState,
  load,
  merge,
  receiveSyncMessage,
  save,
  SyncState,
  Text,
} from "automerge";

const backends: Record<string, IDataBackend<any>> = {};

export function createDataBackend<T>(
  docId: string,
  _persistanceAdapter: (backend: IDataBackend<T>) => IPersistanceAdapter<T>,
  messageAdapter: IMessageAdapter
): IDataBackend<T> {
  if (docId in backends) return backends[docId] as IDataBackend<T>;

  const otherTasks = createSerializer();

  const backend = {
    load: _load,
    update,
    close,
    setDefault(v: any) {
      defaultValue = v;
    },
    get _doc() {
      return doc;
    },
    _addSubscriber: (sub: ISubscriber<T>) => {
      subscribers.push(sub);
      return () => {
        const index = subscribers.findIndex((s) => s === sub);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
      };
    },
  };

  let doc: FreezeObject<T>;
  const subscribers: ISubscriber<T>[] = [];
  const persistanceAdapter = _persistanceAdapter(backend);
  const peerIds: Set<string> = new Set();
  let defaultValue: any;

  function emit(eventType: string, data: unknown) {
    subscribers.forEach((sub) => {
      if ("handle" in sub) sub.handle(eventType as any, data as any);
    });
  }

  async function readSyncState(peerId: string): Promise<SyncState> {
    let peerSyncState = await persistanceAdapter.loadSyncState(peerId, docId);
    if (peerSyncState) {
      return peerSyncState;
    }
    return initSyncState();
  }

  async function writeSyncState(peerId: string, syncState: SyncState) {
    return persistanceAdapter.saveSyncState(peerId, docId, syncState);
  }

  async function getSyncMessageForPeer(peerId: string) {
    if (!peerId) return;

    const [newSyncState, syncMessage] = generateSyncMessage(
      doc,
      await readSyncState(peerId)
    );

    await writeSyncState(peerId, newSyncState);

    return syncMessage?.toString();
  }

  async function applySyncMessage(
    syncMessage: BinarySyncMessage,
    peerId: string
  ) {
    const [newDoc, newSyncState, patch] = receiveSyncMessage(
      doc,
      await readSyncState(peerId),
      syncMessage
    );
    doc = newDoc;

    console.log("[backend] received change, patch:", patch);

    if (newSyncState) {
      await writeSyncState(peerId, newSyncState);
    }

    await writeDocument();

    return patch;
  }

  // TODO: unsubscribe from all messageAdapter things
  const listeners = [];

  function initNetwork() {
    // Say hello to all my peers;
    messageAdapter.broadcast("open-document", docId);

    // When the connection to a specific peer is made,
    // send the current open document id
    messageAdapter.on(
      "connect",
      (peerId: string) => {
        messageAdapter.sendTo(peerId, "open-document", docId);
      },
      { listeners }
    );

    // Respond to open documents
    messageAdapter.on(
      "open-document",
      async (remoteDocId: string, peerId: string) => {
        const finishTask = await otherTasks("handleOpenDocument");

        if (remoteDocId !== docId) return;
        console.log("[backend] received sync request", remoteDocId, peerId);
        const newSyncMessage = await getSyncMessageForPeer(peerId);

        // Respond even when we have no changes
        // so the other peer knows we have the document open
        messageAdapter.sendTo(peerId, "sync-data", {
          docId,
          data: newSyncMessage,
        });

        finishTask();
      },
      { listeners }
    );

    messageAdapter.on(
      "close-document",
      (peerId: string) => {
        peerIds.delete(peerId);
      },
      { listeners }
    );

    messageAdapter.on(
      "disconnect",
      (peerId: string) => {
        peerIds.delete(peerId);
      },
      { listeners }
    );

    // Respond to sync requests
    messageAdapter.on(
      "sync-data",
      async (
        { docId: remoteDocId, data: rawSyncData },
        peerId: string = "server"
      ) => {
        if (remoteDocId !== docId) return;
        peerIds.add(peerId);
        if (!rawSyncData) return;

        const finishTask = await otherTasks("handleSync");

        // Decode incoming stringified Uint8Array
        const syncData = parseBinary(rawSyncData) as BinarySyncMessage;

        console.groupCollapsed(
          "[backend] received sync data from",
          peerId,
          "for",
          docId
        );
        console.log(syncData);
        console.groupEnd();

        const changes = await applySyncMessage(syncData, peerId);

        // TODO: handle changes on incoming sync message;
        console.log("[backend] applied message changes: ", changes);

        const syncMessage = await getSyncMessageForPeer(peerId);

        if (syncMessage) {
          console.log("[backend] sending sync request to", peerId);
          messageAdapter.sendTo(peerId, "sync-data", {
            data: syncMessage,
            docId,
          });
        } else {
          console.log("[backend] sync complete with", peerId);
        }

        finishTask();
      },
      { listeners }
    );
  }

  async function writeDocument() {
    subscribers.forEach((sub) => sub.handle("data", doc as T));

    peerIds.forEach(async (peerId) => {
      const syncMessage = await getSyncMessageForPeer(peerId);
      if (syncMessage) {
        messageAdapter.sendTo(peerId, "sync-data", {
          docId,
          data: syncMessage,
        });
      }
    });

    return persistanceAdapter.saveDocument(docId, save(doc));
  }

  async function _load(path?: string) {
    const finishTask = await otherTasks("loadDoc");

    let initialData = await persistanceAdapter.loadDocument(docId, path);

    console.groupCollapsed("[backend] initialData:");
    console.log(initialData);
    if (initialData instanceof Uint8Array) {
      console.log("[crdt] init from save file");
      doc = load(initialData as BinaryDocument);
    } else if (initialData) {
      console.log("[crdt] init load from object");
      doc = merge(init(), from(initialData));
      await writeDocument();
    } else if (defaultValue) {
      console.log("[crdt] init from defaultValue");
      if (defaultValue === "doc") {
        doc = change(init(), (doc: any) => {
          doc.content = new Text("#Title");
        });
      } else {
        doc = merge(init(), from(defaultValue));
      }
      await writeDocument();
    } else {
      console.log("[crdt] init empty document");
      doc = init();
      await writeDocument();
    }

    console.log(doc);
    console.groupEnd();

    emit("data", doc);
    initNetwork();
    finishTask();

    return doc as T;
  }

  function close() {
    messageAdapter.broadcast("close-document", docId);
    // Remove all listeners
    listeners.forEach((remove) => remove());
    // Close
    delete backends[docId];
  }

  async function update(cb: (doc: FreezeObject<T>) => FreezeObject<T>) {
    const newDoc = change(doc, cb);
    doc = newDoc;
    await writeDocument();
  }

  backends[docId] = backend;
  return backend;
}
