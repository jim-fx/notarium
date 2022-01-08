import { BinarySyncMessage, save } from "automerge";
import createDataStore from "./TreeCRDT";

function splitPath(p: string) {
  return p.split("/").filter((v) => !!v.length);
}

function findChild(tree: TreeData, n: string) {
  return tree.children?.find((c) => c.path === n);
}

export function createTree(
  createAdapter: ITreeAdapterCreator,
  syncAdapter: ISyncAdapter
): Tree {
  const exp: Tree = {
    deleteNode,
    createNode,
    findNode,

    load,
    getTree() {
      return crdt?.currentDoc;
    },
    _addAdapter,
    _pushChangesToAdapter,
    _emit: () => {},
  };

  const initialAdapter = createAdapter(exp);

  let crdt: ReturnType<typeof createDataStore>;
  const adapters: Partial<ITreeAdapter>[] = [initialAdapter];

  function _addAdapter(adapter: ITreeAdapterCreatorPartial) {
    adapters.push(adapter(exp));
  }

  let _pushTimeout: NodeJS.Timeout;
  function _pushChangesToAdapter(adapter?: ITreeAdapter) {
    if (_pushTimeout) clearTimeout(_pushTimeout);
    _pushTimeout = setTimeout(() => {
      adapters.forEach((a) => {
        if (a !== adapter) {
          a?.write?.(crdt.currentDoc);
        }
      });
    }, 200);
  }

  function findNode(path: string) {
    return crdt.currentDoc;
  }
  function createNode(path: string) {}
  function deleteNode(path: string) {
    const p = splitPath(path);
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

    _pushChangesToAdapter();
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
    // Start a sync cycle with the server first
    // if ("sendToServer" in syncAdapter) {
    //   console.log("tree: request server sync");
    //   const syncMessage = await crdt.getSyncForPeer("server");
    //   if (syncMessage) {
    //     syncAdapter.sendToServer("sync-data", syncMessage);
    //   } else {
    //     _pushChangesToAdapter();
    //   }
    // }

    // Sync with peers when they connect
    syncAdapter.on("connect", async (peerId) => {
      const syncMessage = await crdt.getSyncForPeer(peerId as string);
      if (syncMessage) {
        syncAdapter.sendTo(peerId as string, "sync-data", syncMessage);
      } else {
        _pushChangesToAdapter();
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
        _pushChangesToAdapter();
      }
    );
  }

  async function load(path?: string) {
    const _data = await initialAdapter.read(path);
    crdt = createDataStore(_data, initialAdapter);
    initListeners();
    _pushChangesToAdapter();
    return;
  }

  return exp;
}
