import {createFileSystem, type FileSystem} from '@notarium/fs';

import {P2PClient, createNetworkAdapter, IDBAdapter} from '@notarium/adapters';

import {browser} from '$app/env';

const adapters = [];

let rootPath = "main"

if (browser) {
  const networkAdapter =
      createNetworkAdapter([ 'ws://localhost:3000/ws' ], P2PClient);
  globalThis['n'] = P2PClient;
  adapters.push(IDBAdapter, networkAdapter);
}
else {

  rootPath = import.meta.env.VITE_ROOT_PATH as string;

  adapters.push(async (fs: FileSystem) => {
    const {FSAdapter} =
        await import('@notarium/adapters/persistance/FSAdapter');

    return FSAdapter(fs);
  });
}

export default createFileSystem(adapters, {rootPath});
