import {
  ISyncAdapter,
  ITreeAdapter,
  ITreeAdapterFactory,
  Tree,
  TreeData,
} from "@notarium/types";
import { BinarySyncMessage } from "automerge";
import createDataStore from "./TreeCRDT";

function splitPath(p: string) {
  return p.split("/").filter((v) => !!v.length);
}

function findChild(tree: TreeData, n: string) {
  return tree.children?.find((c) => c.path === n);
}

export function createTree(
  createAdapter: ITreeAdapterFactory,
  syncAdapter: ISyncAdapter
): Tree {
  const exp: Tree = {
    deleteNode,
    createNode,
    findNode,

    load,
    _addAdapter,
    _pushChangesToAdapters,
  };

  const initialAdapter = createAdapter(exp);

  let crdt: ReturnType<typeof createDataStore>;
  const adapters: Partial<ITreeAdapter>[] = [initialAdapter];

  function _addAdapter(adapter: ITreeAdapterFactory<Partial<ITreeAdapter>>) {
    adapters.push(adapter(exp));
  }

  let _pushTimeout: NodeJS.Timeout;
  function _pushChangesToAdapters(adapter?: ITreeAdapter) {
    if (_pushTimeout) clearTimeout(_pushTimeout);
    _pushTimeout = setTimeout(() => {
      adapters.forEach((a) => {
        if (a !== adapter) {
          a?.writeTree?.(crdt?.currentDoc);
        }
      });
    }, 200);
  }

  function findNode(path: string = "/") {
    if (path === "/") {
      return crdt?.currentDoc;
    }
    // TODO: implement findNode
    return crdt?.currentDoc;
  }
  function createNode(path: string) {}
  function deleteNode(path: string) {
    const p = splitPath(path);
    // Disallow deleting of root dir
    if (!p.length) return;
    p.shift();

    crdt.update((doc) => {
      let currentNode = doc;
      while (p.length) {
        const n = p.shift();
        const nextNode = findChild(currentNode, n as string);
        if (!currentNode) break;
        if (p.length === 0 && currentNode && nextNode) {
          const childIndex = currentNode.children?.indexOf(nextNode);
          if (typeof childIndex === "number" && childIndex !== -1) {
            currentNode.children?.deleteAt?.(childIndex);
          }
        } else {
          currentNode = nextNode as any;
        }
      }
    });

    _pushChangesToAdapters();
    _pushChangesToPeers();
  }

  async function _pushChangesToPeers() {
    const peerIds = await initialAdapter.getPeerIds();
    console.log(peerIds);
    for (const peerId of peerIds) {
      console.log("crdt::syncing", peerId);
      const syncMessage = await crdt.getSyncForPeer(peerId);
      if (syncMessage) {
        syncAdapter.sendTo(peerId, "sync-data", syncMessage);
      }
    }
  }

  async function initListeners() {
    // Sync with peers when they connect
    syncAdapter.on("connect", async (peerId) => {
      console.log("crdt::connected to " + peerId);
      const syncMessage = await crdt.getSyncForPeer(peerId as string);
      if (syncMessage) {
        syncAdapter.sendTo(peerId as string, "sync-data", syncMessage);
      } else {
        _pushChangesToAdapters();
      }
    });

    // Sync with peers
    syncAdapter.on(
      "sync-data",
      async (rawSyncData, peerId: string = "server") => {
        console.log("received sync data");

        // Decoding incomming stringified Uint8Array
        const syncData = Uint8Array.from(
          (rawSyncData as string).split(",").map((v) => parseInt(v))
        ) as BinarySyncMessage;
        console.log("received sync data from", peerId);

        const syncMessage = await crdt.handleSyncMessage(syncData, peerId);

        if (syncMessage) {
          console.log("sending sync request");
          syncAdapter.sendTo(peerId, "sync-data", syncMessage);
        } else {
          console.log("sync complete");
        }
        _pushChangesToAdapters();
      }
    );
  }

  async function load(path?: string) {
    const _data = await initialAdapter.readTree(path);
    crdt = createDataStore(_data, initialAdapter);
    initListeners();
    _pushChangesToAdapters();
    return;
  }

  return exp;
}
