import WSClient from "@notarium/adapters/WSClient";
import { resolve } from "path";
import * as Y from "yjs";
import { createDataBackend, createTree } from "@notarium/data";
import {
  FSTextAdapter,
  SQLAdapter,
  FSTreeAdapter,
} from "@notarium/adapters/fs";

const ROOT_PATH = resolve(__dirname, "../../../test");

const treeBackend = createDataBackend<Y.Doc>("tree", {
  persistanceAdapterFactory: [SQLAdapter, FSTreeAdapter],
  messageAdapter: WSClient,
  flags: {
    ROOT_PATH,
  },
});

treeBackend.load();

const tree = createTree(treeBackend);

const docStore = {};
async function createDoc(docId: string) {
  if (docId in docStore) return docStore[docId];
  docStore[docId] = createDataBackend<string>(docId, {
    persistanceAdapterFactory: [SQLAdapter, FSTextAdapter],
    messageAdapter: WSClient,
    flags: {
      ROOT_PATH,
    },
  });
  docStore[docId].load();
  return docStore[docId];
}

export { tree, createDoc };
export default docStore;
