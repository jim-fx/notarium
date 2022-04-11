import { createFileSystem, type FileSystem } from '@notarium/fs';
import { createNetworkAdapter } from '@notarium/adapters';
import { browser } from '$app/env';
import { IDBAdapter } from "@notarium/adapters"

const adapters = [];

let rootPath = "main"

if (browser) {
  adapters.push(IDBAdapter)
  adapters.push(async (fs: FileSystem) => {
    const P2PClient = await import("@notarium/adapters/network/P2PClient");
    const networkAdapter =
      createNetworkAdapter(['ws://localhost:3000'], P2PClient);
    return networkAdapter(fs);
  })
}
else {

  rootPath = import.meta.env.VITE_ROOT_PATH as string;

  adapters.push(async (fs: FileSystem) => {
    const { FSAdapter } =
      await import('@notarium/adapters/persistance/FSAdapter');

    return FSAdapter(fs);
  });
}

export default createFileSystem(adapters, { rootPath });
