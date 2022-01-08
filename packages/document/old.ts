import * as Automerge from "automerge";
import p2p from "@notarium/p2p-client";
import { writable } from "svelte/store";

let currentDoc = Automerge.from({
  type: "md",
  path: "/test/okat/asd",
  frontmatter: {
    title: "Empty",
    some: "random",
    shit: true,
  },
  blocks: [
    {
      type: "h1",
      data: {
        some: "stuff",
      },
    },
  ],
});

const syncStates: Record<string, Automerge.SyncState> = {};
const backends: Record<string, Automerge.BackendState> = {
  main: Automerge.Frontend.getBackendState(currentDoc),
};

if ("window" in globalThis) {
  window["backends"] = backends;
  window["syncStates"] = syncStates;
}

function updatePeers(docId: string = "main") {
  console.log("crdt::updatePeers:");
  Object.entries(syncStates).forEach(([peerId, syncState]) => {
    console.log("   [" + peerId + "]");
    const [nextSyncState, syncMessage] = Automerge.Backend.generateSyncMessage(
      backends[docId],
      syncState[docId] || Automerge.Backend.initSyncState()
    );
    syncStates[peerId] = { ...syncStates[peerId], [docId]: nextSyncState };
    if (syncMessage) {
      p2p.sendTo(peerId, "sync", {
        syncMessage: syncMessage.toString(),
        docId,
      });
      console.log("    - needs update");
    } else {
      console.log("    - no update");
    }
  });
}

function handleIncomingSync(docId: string, peerId: string, syncMessage) {
  const [nextBackend, nextSyncState, patch] =
    Automerge.Backend.receiveSyncMessage(
      backends[docId],
      syncStates[peerId][docId] || Automerge.Backend.initSyncState(),
      syncMessage
    );
  backends[docId] = nextBackend;
  syncStates[peerId] = { ...syncStates[peerId], [docId]: nextSyncState };

  updatePeers(docId);

  if (patch) {
    console.log("Patch", patch);
    currentDoc = Automerge.Frontend.applyPatch(
      currentDoc,
      patch,
      backends.main
    );
    store.set(currentDoc);
  }
}

p2p.on("sync", ({ syncMessage, docId }, peerId) => {
  console.log("crdt::sync", { peerId, docId });
  let syncMessageDecoded = Uint8Array.from(
    syncMessage.split(",").map((v) => parseInt(v))
  );

  handleIncomingSync(docId, peerId, syncMessageDecoded);
});

p2p.on("connect", (_, peerId) => {
  console.log("crdt::connected to " + peerId);
  const docId = "main";
  if (syncStates[peerId] === undefined) {
    syncStates[peerId] = {};
    // In the future try to load from disk
    syncStates[peerId][docId] = Automerge.Backend.initSyncState();
  }
});

export const store = writable(currentDoc);

export function setTitle(d: string) {
  const newDoc = Automerge.change(currentDoc, "Change Title", (doc) => {
    //@ts-ignore
    doc.frontmatter.title = d;
  });

  const binaryChanges = Automerge.getChanges(currentDoc, newDoc);

  let newBackend = Automerge.Backend.applyChanges(backends.main, binaryChanges);

  backends["main"] = newBackend;

  currentDoc = newDoc;
  store.set(currentDoc);

  updatePeers("main");
}
