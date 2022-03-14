import { resolve } from "path";
import { createFileSystem } from "@notarium/fs";
import WSClient from "@notarium/adapters/network/WSClient";
import { SQLAdapter, FSAdapter } from "@notarium/adapters/fs";
import { createNetworkAdapter } from "@notarium/adapters";

const ROOT_PATH = resolve(__dirname, "../../../test");

const fs = createFileSystem(
  [SQLAdapter, FSAdapter, createNetworkAdapter([], WSClient)],
  {
    rootPath: ROOT_PATH,
    autoOpen: true,
  }
);

export default fs;
