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

const fs = createFileSystem(
  [
    SQLAdapter,
    FSTextAdapter,
    FSTreeAdapter,
    createNetworkAdapter([], WSClient),
  ],
  {
    rootPath: ROOT_PATH,
    autoOpen: true,
  }
);

export default fs;