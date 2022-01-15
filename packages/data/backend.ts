import {
  IPersistanceAdapter,
  IMessageAdapter,
  IDataBackend,
} from "@notarium/types";

import {
  BinaryDocument,
  BinarySyncMessage,
  change,
  FreezeObject,
  from,
  generateSyncMessage,
  init,
  initSyncState,
  load,
  merge,
  receiveSyncMessage,
  SyncState,
} from "automerge";

export function createDataBackend<T>(
  docId: string,
  persistanceAdapter: IPersistanceAdapter<T>,
  messageAdapter: IMessageAdapter
): IDataBackend<T> {
  let doc: FreezeObject<T>;

  async function readSyncState(peerId: string): Promise<SyncState> {
    let peerSyncState = await persistanceAdapter.loadSyncState(peerId, docId);
    if (peerSyncState) {
      console.groupCollapsed("[backend] found sync state for " + peerId);
      console.log(peerSyncState);
      console.groupEnd();
      return peerSyncState;
    }
    return initSyncState();
  }

  async function writeSyncState(peerId: string, syncState: SyncState) {
    console.groupCollapsed("[backend] write sync state", peerId);
    console.log(syncState);
    console.groupEnd();
    return persistanceAdapter.saveSyncState(peerId, docId, syncState);
  }

  async function getSyncForPeer(peerId: string) {
    console.log("[backend] get syncState for peer", peerId);
    if (!peerId) return;

    const [newSyncState, syncMessage] = generateSyncMessage(
      doc,
      await readSyncState(peerId)
    );

    await writeSyncState(peerId, newSyncState);

    if (syncMessage) {
      return syncMessage.toString();
    }

    return;
  }

  async function handleSyncMessage(
    syncMessage: BinarySyncMessage,
    peerId: string
  ) {
    const [newDoc, newSyncState, patch] = receiveSyncMessage(
      doc,
      await readSyncState(peerId),
      syncMessage
    );

    console.log("[backend] received change, patch:", patch);

    doc = newDoc;
    const newSyncMessage = await getSyncForPeer(peerId);

    if (newSyncState) {
      await writeSyncState(peerId, newSyncState);
    }

    return [newSyncMessage?.toString(), patch];
  }

  // TODO: unsubscribe from all messageAdapter things
  function initNetwork() {
    // Say hello to all my peers;
    messageAdapter.broadcast("open-document", docId);

    // Respond to sync requests
    messageAdapter.on(
      "sync-data",
      async (
        { docId: remoteDocId, data: rawSyncData },
        peerId: string = "server"
      ) => {
        if (remoteDocId !== docId) return;
        console.log(rawSyncData);

        // Decode incoming stringified Uint8Array
        const syncData = Uint8Array.from(
          (rawSyncData as string).split(",").map((v) => parseInt(v))
        ) as BinarySyncMessage;

        console.groupCollapsed("[backend] received sync data from", peerId);
        console.log(syncData);
        console.groupEnd();

        const [syncMessage, changes] = await handleSyncMessage(
          syncData,
          peerId
        );

        // TODO: handle changes on incoming sync message;
        console.log(changes);

        if (syncMessage) {
          console.log("[backend] sending sync request to", peerId);
          messageAdapter.sendTo(peerId, "sync-data", {
            data: syncMessage,
            docId,
          });
        } else {
          console.log("[backend] sync complete with", peerId);
        }
      }
    );
  }

  async function _load() {
    let initialData = await persistanceAdapter.loadDocument(docId);

    console.groupCollapsed("[backend] initialData:");
    console.log(initialData);
    if (initialData instanceof Uint8Array) {
      console.log("[crdt] init from save file");
      doc = load(initialData as BinaryDocument);
    } else if (initialData) {
      console.log("[crdt] init load from object");
      doc = merge(init(), from(initialData));
    } else {
      console.log("[crdt] init empty document");
      doc = init();
    }
    console.groupEnd();

    initNetwork();

    return doc as T;
  }

  function close() {}

  function _update(cb: (doc: T) => void) {
    const newDoc = change(doc, cb);
    doc = newDoc;
  }

  return {
    load: _load,
    update: _update,
    close,
  };
}
