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

const hexEncode = function (input: string) {
  let hex, i;
  let result = "";
  for (i = 0; i < input.length; i++) {
    hex = input.charCodeAt(i).toString(16);
    result += ("000" + hex).slice(-4);
  }
  return result;
};

export default function createDataStore(
  initialData: BinaryDocument | TreeData | null,
  adapter: ITreeAdapter
) {
  let id = getId() as string | undefined;
  if (id) id = hexEncode(id);

  type TreeDoc = FreezeObject<TreeData>;

  let currentDoc: TreeDoc;
  if (initialData instanceof Uint8Array) {
    console.log("crdt::init from serialized");
    currentDoc = load(initialData as BinaryDocument, id);
  } else if (initialData) {
    console.log("crdt::init load from object");
    currentDoc = merge(init(id), from(initialData, id));
  } else {
    console.log("crdt::init empty document");
    currentDoc = init(id);
  }

  async function readSyncState(peerId: string): Promise<SyncState> {
    let peerSyncState = await adapter.readSyncData(peerId);
    if (!peerSyncState) {
      console.log("crdt::init sync data for " + peerId);
      return initSyncState();
    } else {
      console.log("crdt::found sync data for " + peerId);
      return Automerge.Backend.decodeSyncState(peerSyncState);
    }
  }

  async function writeSyncData(peerId: string, syncState: SyncState) {
    return adapter.writeSyncData(
      peerId,
      Automerge.Backend.encodeSyncState(syncState)
    );
  }

  function update(cb: (d: TreeDoc) => void) {
    const [newDoc] = Frontend.change(currentDoc, cb);
    currentDoc = newDoc;
  }

  async function handleSyncMessage(
    syncMessage: BinarySyncMessage,
    peerId: string = "server"
  ) {
    const [newDoc, newSyncState, patch] = receiveSyncMessage(
      currentDoc,
      await readSyncState(peerId),
      syncMessage
    );

    console.log(receiveSyncMessage);

    console.log("crdt::received change, patch:", patch);

    currentDoc = newDoc;

    const newSyncMessage = await getSyncForPeer(peerId);

    console.log("crdt:writesync data for " + peerId);
    await writeSyncData(peerId, newSyncState);

    if (newSyncMessage) {
      return newSyncMessage.toString();
    }

    return;
  }

  async function getSyncForPeer(peerId: string = "server") {
    console.log("crdt::get sync for peer", peerId);

    const [newSyncState, syncMessage] = generateSyncMessage(
      currentDoc,
      await readSyncState(peerId)
    );

    await writeSyncData(peerId, newSyncState);

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
