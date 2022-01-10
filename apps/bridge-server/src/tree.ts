import { createTree } from "@notarium/tree";
import { FSAdapter } from "@notarium/adapters/FSAdapter";
import { resolve } from "path";
import * as wsAdapter from "./websocket";

const tree = createTree(FSAdapter, wsAdapter);
tree.load(resolve(__dirname, "../../../test"));

export { tree };
export default tree;
