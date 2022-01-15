import { FSAdapter } from "@notarium/adapters/FSAdapter";
import { resolve } from "path";
import * as wsAdapter from "./websocket";
import type { TreeData } from "@notarium/types";
import { createDataBackend } from "@notarium/data";
import { createTree } from "@notarium/tree";

const treeBackend = createDataBackend<TreeData>("tree", FSAdapter, wsAdapter);

treeBackend.load(resolve(__dirname, "../../../test"));

const tree = createTree(treeBackend);

export default tree;
