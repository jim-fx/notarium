import * as Automerge from "automerge";
import DiffMatchPatch from "diff-match-patch";
import p2p from "@notarium/p2p-client";
import { writable } from "svelte/store";

let currentDoc = Automerge.from({
  path: "/test/okat/asd.md",
  content: new Automerge.Text(`Lorem ipsum
dolor shit
amet`),
});

const syncStates = {};

function updatePeer(peerId: string) {
  const [newSyncState, syncMessage] = Automerge.generateSyncMessage(
    currentDoc,
    syncStates[peerId] || Automerge.initSyncState()
  );
  syncStates[peerId] = newSyncState;
  if (syncMessage) {
    p2p.sendTo(peerId, "sync", syncMessage.toString());
  }
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

  updatePeer(peerId);

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

const dmp = new DiffMatchPatch();
export function setText(t: string) {
  // Compute the diff:
  const diff = dmp.diff_main(currentDoc.content.toString(), t);
  // diff is simply an array of binary tuples representing the change
  // [[-1,"The ang"],[1,"Lucif"],[0,"e"],[-1,"l"],[1,"r"],[0," shall "],[-1,"fall"],[1,"rise"]]

  // This cleans up the diff so that the diff is more human friendly.
  dmp.diff_cleanupSemantic(diff);
  // [[-1,"The angel"],[1,"Lucifer"],[0," shall "],[-1,"fall"],[1,"rise"]]

  console.log(diff, currentDoc.content.toString());

  const patches = dmp.patch_make(currentDoc.content.toString(), diff);

  const newDoc = Automerge.change(currentDoc, (doc) => {
    patches.forEach((patch) => {
      let idx = patch.start1;
      patch.diffs.forEach(([operation, changeText]) => {
        switch (operation) {
          case 1: // Insertion
            doc.content.insertAt(idx, ...changeText.split(""));
          case 0: // No Change
            idx += changeText.length;
            break;
          case -1: // Deletion
            for (let i = 0; i < changeText.length; i++) {
              doc.content.deleteAt(idx);
            }
            break;
        }
      });
    });
  });

  currentDoc = newDoc;
  store.set(currentDoc);
  updatePeers();
}
