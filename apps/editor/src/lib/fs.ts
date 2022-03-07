import { createFileSystem } from '@notarium/fs';

import { P2PClient, createNetworkAdapter, IDBAdapter } from '@notarium/adapters';

const networkAdapter = createNetworkAdapter(['ws://localhost:3000/ws'], P2PClient);

globalThis['n'] = P2PClient;

export default createFileSystem([IDBAdapter, networkAdapter], { rootPath: 'main' });
