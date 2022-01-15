import {
  ISyncAdapter,
  ITreeAdapter,
  ITreeAdapterFactory,
  Tree,
  TreeData,
} from "@notarium/types";
import {
  BinaryDocument,
  BinarySyncMessage,
  BinarySyncState,
  save,
} from "automerge";
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
      const doc = crdt.currentDoc;
      const bin = save(doc);
      adapters.forEach((a) => {
        if (a !== adapter) {
          a?.writeTree?.(doc, bin);
        }
      });
    }, 200);
  }

  function findNode(path: string = "/") {
    if (path === "/") {
      return crdt?.currentDoc;
    }

    const p = splitPath(path);
    p.shift();

    let currentNode = crdt.currentDoc;

    while (p.length) {
      const name = p.shift();
      currentNode = findChild(currentNode, name);
    }

    return currentNode;
  }
  function createNode(path: string, content: string) {
    const p = splitPath(path);
    p.shift();
    console.log("create new ", path);
    crdt.update((doc) => {
      let currentNode = doc;
      while (p.length) {
        const n = p.shift();
        if (p.length === 0 && n && currentNode) {
          if ("children" in currentNode) {
            currentNode?.children?.push({
              path: n,
            });
          } else {
            currentNode.children = [{ path: n }];
          }
          console.log(currentNode);
        } else {
          currentNode = findChild(currentNode, n as string) as any;
          if (!currentNode) break;
        }
      }
    });
    _pushChangesToAdapters();
    _pushChangesToPeers();
  }
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
      console.log("[tree] syncing", peerId);
      const syncMessage = await crdt.getSyncForPeer(peerId);
      if (syncMessage) {
        syncAdapter.sendTo(peerId, "sync-data", syncMessage);
      }
    }
  }

  async function _syncWithPeer(peerId: string) {
    const syncMessage = await crdt.getSyncForPeer(peerId);
    if (syncMessage) {
      syncAdapter.sendTo(peerId, "sync-data", syncMessage);
    }
    // _pushChangesToAdapters();
  }

  async function initListeners() {
    // Sync with new peers when they connect
    syncAdapter.on("connect", async (peerId) => {
      console.log("[tree] connected to " + peerId);
      _syncWithPeer(peerId as string);
    });

    // Start syncing with other peers
    // syncAdapter.on("connectToServer", () => {
    //   syncAdapter.getPeerIds().forEach((peerId) => {
    //     _syncWithPeer(peerId);
    //   });
    // });

    // Sync with peers
    syncAdapter.on(
      "sync-data",
      async (rawSyncData, peerId: string = "server") => {
        console.log(rawSyncData);

        // Decode incoming stringified Uint8Array
        const syncData = Uint8Array.from(
          (rawSyncData as string).split(",").map((v) => parseInt(v))
        ) as BinarySyncMessage;

        console.groupCollapsed("[tree] received sync data from", peerId);
        console.log(syncData);
        console.groupEnd();

        const [syncMessage, changes] = await crdt.handleSyncMessage(
          syncData,
          peerId
        );

        // TODO: handle changes on incoming sync message;

        if (syncMessage) {
          console.log("[tree] sending sync request to", peerId);
          syncAdapter.sendTo(peerId, "sync-data", syncMessage);
        } else {
          console.log("[tree] sync complete with", peerId);
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
