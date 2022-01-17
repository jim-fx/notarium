import { FSAdapter } from "@notarium/adapters/FSAdapter";
import { resolve } from "path";
import WSClient from "@notarium/adapters/WSClient";
import type { DocumentData, TreeData } from "@notarium/types";
import { createDataBackend, createTree } from "@notarium/data";

const treeBackend = createDataBackend<TreeData>("tree", FSAdapter, WSClient);

treeBackend.load(resolve(__dirname, "../../../test"));

const tree = createTree(treeBackend);

export default tree;
