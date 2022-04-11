import { IMessageAdapter } from "@notarium/types";
import type { AdapterFactory, FileSystem, File } from "@notarium/fs";
import {
  applyUpdateV2,
  Doc,
  encodeStateAsUpdateV2,
} from "yjs";
import { logger, parseBinary } from "@notarium/common";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";

const log = logger("adapt/net");

logger.setFilter("")

const IS_BROWSER = ("window" in globalThis);

export function createNetworkAdapter(
  urls: string[],
  adapter: IMessageAdapter
): AdapterFactory {
  return async (fs: FileSystem) => {
    const id = Symbol("adapt/network");

    urls.forEach((c) => {
      adapter.connect(c);
    });

    const files: Record<string, File> = {};
    const peers: Record<string, Set<string>> = {};

    adapter.on(
      "doc.open",
      async ({ path, stateVector: rawStateVector }, { peerId }) => {
        if (fs.flags.autoOpen && !(path in files)) {
          files[path] = fs.openFile(path);
        }

        if (path in files) {
          log("Open File", { peerId, path });
          peers[path] = (peers[path] || new Set()).add(peerId);
          const file = files[path];

          await file.load();
          if (file.isCRDT) {
            const doc = file.getData() as Doc;
            const remoteStateVec = parseBinary(rawStateVector);

            const update = encodeStateAsUpdateV2(doc, remoteStateVec);

            adapter.sendTo(peerId, "doc.update", {
              update: update.join(),
              path,
            });
          }
        }
      }
    );

    adapter.on(
      "doc.update",
      async ({ path, update: rawSyncData }, { peerId }) => {
        let file = files[path];

        peers[path] = (peers[path] || new Set()).add(peerId);

        if (!file && fs.flags.autoOpen) {
          file = fs.openFile(path);
        }

        if (file) {
          await file.load();
          if (file.isCRDT) {
            file.update((doc: Doc) => {
              const update = parseBinary(rawSyncData);
              // applyUpdateV2(doc, update, peerId);
            }, id);
          }
        }
      }
    );

    adapter.on("doc.close", ({ path }, { peerId }) => {
      if (path in peers) {
        peers[path].delete(peerId);
      }
    });

    return {
      id,
      on: adapter.on,
      async requestFile(file: File) {
        log("request file", file);
        if (file.isCRDT) {
          file.isLoaded.then(() => {
            const doc = file.getData() as Doc;
            if (IS_BROWSER) {
              file.stuff["yjs.ws"] = new WebsocketProvider(urls[0] + "/yjs", file.path, doc);
              file.stuff["yjs.rtc"] = new WebrtcProvider(file.path, doc, { signaling: [urls[0] + "/signal"] });
            }
          });
        } else {
          return adapter.requestFile(file.path);
        }
        files[file.path] = file;
      },
      async saveFile(f: File, update: Uint8Array) {
        // log("save", peers, f.path);
        if (f.path in peers && update) {
          peers[f.path].forEach((id) => {
            adapter.sendTo(id, "doc.update", {
              path: f.path,
              update: update.join(),
            });
          });
        }
      },
      async closeFile(f: File) {
        adapter.broadcast("doc.close", { path: f.path });
      },
    };
  };
}
