import { ITreeAdapter, TreeData } from "@notarium/types";
import Automerge, {
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
  merge,
} from "automerge";

function getId() {
  if ("localStorage" in globalThis && "p2p-id" in localStorage) {
    let id = localStorage.getItem("p2p-id");
    if (id === "undefined" || id === "null") {
      localStorage.removeItem("p2p-id");
      return undefined;
    }
    return id;
  }
}

export default function createDataStore(
  initialData: BinaryDocument | TreeData | null,
  adapter: ITreeAdapter
) {
  type TreeDoc = FreezeObject<TreeData>;

  let currentDoc: TreeDoc;
  if (initialData instanceof Uint8Array) {
    console.log("[crdt] init from save file");
    currentDoc = load(initialData as BinaryDocument);
  } else if (initialData) {
    console.log("[crdt] init load from object");
    currentDoc = merge(init(), from(initialData));
  } else {
    console.log("[crdt] init empty document");
    currentDoc = init();
  }

  async function readSyncState(peerId: string): Promise<SyncState> {
    let peerSyncState = await adapter.readSyncState(peerId);
    if (peerSyncState) {
      console.groupCollapsed("[crdt] found sync state for " + peerId);
      console.log(peerSyncState);
      console.groupEnd();
      return peerSyncState;
    }
    return initSyncState();
  }

  async function writeSyncState(peerId: string, syncState: SyncState) {
    console.groupCollapsed("[crdt] write sync state", peerId);
    console.log(syncState);
    console.groupEnd();
    return adapter.writeSyncState(peerId, syncState);
  }

  function update(cb: (d: TreeDoc) => void) {
    const [newDoc] = Frontend.change(currentDoc, cb);
    currentDoc = newDoc;
  }

  async function handleSyncMessage(
    syncMessage: BinarySyncMessage,
    peerId: string
  ) {
    const [newDoc, newSyncState, patch] = receiveSyncMessage(
      currentDoc,
      await readSyncState(peerId),
      syncMessage
    );

    console.log("[crdt] received change, patch:", patch);

    currentDoc = newDoc;
    const newSyncMessage = await getSyncForPeer(peerId);

    if (newSyncMessage) {
      await writeSyncState(peerId, newSyncState);
      return newSyncMessage.toString();
    }

    return;
  }

  async function getSyncForPeer(peerId: string = "server") {
    console.log("[crdt] get syncState for peer", peerId);

    const [newSyncState, syncMessage] = generateSyncMessage(
      currentDoc,
      await readSyncState(peerId)
    );

    await writeSyncState(peerId, newSyncState);

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
