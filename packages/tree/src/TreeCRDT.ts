import {
  BinarySyncMessage,
  from,
  load,
  Frontend,
  generateSyncMessage,
  initSyncState,
  receiveSyncMessage,
  SyncState,
  BinaryDocument,
  FreezeObject,
  init,
} from "automerge";

export default function createDataStore(
  initialData: Uint8Array,
  adapter: ITreeAdapter
) {
  console.log("crdt:: load", initialData);

  type TreeDoc = FreezeObject<TreeData>;

  let currentDoc: TreeDoc;
  if (initialData instanceof Uint8Array) {
    currentDoc = load(initialData as BinaryDocument);
  } else if (typeof initialData === "object") {
    currentDoc = from(initialData);
  } else {
    currentDoc = init();
  }

  function update(cb: (d: TreeDoc) => void) {
    const [newDoc] = Frontend.change(currentDoc, cb);
    currentDoc = newDoc;
  }

  async function handleSyncMessage(
    syncMessage: BinarySyncMessage,
    peerId: string = "server"
  ) {
    const [newDoc, newSyncState] = receiveSyncMessage(
      currentDoc,
      ((await adapter.readSyncData(peerId)) as SyncState) || initSyncState(),
      syncMessage
    );

    currentDoc = newDoc;

    const newSyncMessage = await getSyncForPeer(peerId);

    adapter.writeSyncData(peerId, newSyncState);

    if (newSyncMessage) {
      return newSyncMessage.toString();
    }

    return;
  }

  async function getSyncForPeer(peerId: string = "server") {
    let peerSyncState = (await adapter.readSyncData(peerId)) as SyncState;
    if (!peerSyncState) {
      peerSyncState = initSyncState();
    }

    const [newSyncState, syncMessage] = generateSyncMessage(
      currentDoc,
      peerSyncState
    );

    await adapter.writeSyncData(peerId, newSyncState);

    if (syncMessage) {
      return syncMessage.toString();
    }

    return;
  }

  return {
    get currentDoc(): TreeData {
      return currentDoc as TreeData;
    },
    update,
    handleSyncMessage,
    getSyncForPeer,
  };
}
