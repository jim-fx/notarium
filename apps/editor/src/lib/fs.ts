import { createFileSystem } from '@notarium/fs';

import { P2PClient, createNetworkAdapter, IDBAdapter } from '@notarium/adapters';

const networkAdapter = createNetworkAdapter(['ws://localhost:3000/ws'], P2PClient);

export default createFileSystem('main', [networkAdapter, IDBAdapter]);
