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

const syncStates = {};

if ("window" in globalThis) {
  window["Automerge"] = Automerge;
  window["syncStates"] = syncStates;
  window["t"] = {
    get currentDoc() {
      return currentDoc;
    },
  };
}

function updatePeer(peerId: string) {
  const [newSyncState, syncMessage] = Automerge.generateSyncMessage(
    currentDoc,
    syncStates[peerId] || Automerge.initSyncState()
  );
  syncStates[peerId] = newSyncState;
  p2p.sendTo(peerId, "sync", syncMessage.toString());
}

function updatePeers() {
  const peerIds = Object.keys(syncStates);

  peerIds.forEach((peerId) => updatePeer(peerId));
}

p2p.on("connect", (_, peerId) => {
  console.log("crdt::conencted");
  updatePeer(peerId);
});

p2p.on("sync", (c: string, peerId) => {
  let syncMessageDecoded = Uint8Array.from(
    c.split(",").map((v) => parseInt(v))
  ) as Automerge.BinarySyncMessage;

  const [newDoc, newSyncState] = Automerge.receiveSyncMessage(
    currentDoc,
    syncStates[peerId] || Automerge.initSyncState(),
    syncMessageDecoded
  );

  currentDoc = newDoc;
  syncStates[peerId] = newSyncState;
  store.set(currentDoc);
});

export const store = writable(currentDoc);

export function setTitle(d: string) {
  const newDoc = Automerge.change(currentDoc, "Change Title", (doc) => {
    //@ts-ignore
    doc.frontmatter.title = d;
  });
  currentDoc = newDoc;

  store.set(currentDoc);

  updatePeers();
}
