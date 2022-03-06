import { resolve } from "path";
import { createFileSystem } from "@notarium/fs";
import WSClient from "@notarium/adapters/network/WSClient";
import {
  SQLAdapter,
  FSTextAdapter,
  FSTreeAdapter,
} from "@notarium/adapters/fs";
import { createNetworkAdapter } from "@notarium/adapters";

const ROOT_PATH = resolve(__dirname, "../../../test");

export default createFileSystem(ROOT_PATH, [
  SQLAdapter,
  FSTextAdapter,
  FSTreeAdapter,
  createNetworkAdapter([], WSClient),
]);
