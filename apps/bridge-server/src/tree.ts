import { FSAdapter } from "@notarium/adapters/FSAdapter";
import { resolve } from "path";
import WSClient from "@notarium/adapters/WSClient";
import * as Y from "yjs";
import { createDataBackend, createTree } from "@notarium/data";
import { readTreeData } from "./readTree";

const treeBackend = createDataBackend<Y.Doc>("tree", {
  persistanceAdapterFactory: FSAdapter,
  messageAdapter: WSClient,
});

globalThis["backend"] = treeBackend;

treeBackend.load();

const tree = createTree(treeBackend);

const notesPath = resolve(__dirname, "../../../test");

(async () => {
  const treeData = await readTreeData(notesPath);
  tree.setTree(treeData);
})();

export default tree;
