import { IDBAdapter, P2PClient } from '@notarium/adapters';
import { createDataBackend, createTree, createTreeStore } from '@notarium/data';

import type { IDataBackend, IDirectory, IFile, YNode } from '@notarium/types';
import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import { browser } from '$app/env';
import { splitPath } from '../../../../packages/types/node_modules/@notarium/common';

export const treeBackend = createDataBackend<YNode>('tree', {
	persistanceAdapterFactory: IDBAdapter,
	messageAdapter: P2PClient
});

export const treeStore = createTreeStore(treeBackend);

export const treeFrontend = createTree(treeBackend);

export const activeNodeId = derived([page], ([p]) => {
	return p.params?.editPath;
});

export const activeNode = derived([activeNodeId, treeStore], ([id]) => {
	if (!id) return undefined;
	return treeFrontend.findNode(id);
});

let docBackend: IDataBackend<string>;
export const documentBackend = derived([activeNode, activeNodeId], ([n, id]) => {
	if (!n) return undefined;
	if (!['text/plain', 'text/markdown'].includes(n.mimetype)) return undefined;
	if (docBackend) docBackend.close();
	if (browser) {
		docBackend = createDataBackend<string>(id, {
			persistanceAdapterFactory: IDBAdapter,
			messageAdapter: P2PClient
		});
		docBackend.load();
		return docBackend;
	}
});

export const hasActiveNodeIndexMD = derived([activeNode, activeNodeId], ([n, nodeId]) => {
	if (!n) return undefined;

	// If the current node is not a folder go to the parent node
	const path = splitPath(nodeId);
	if (n.mimetype !== 'dir') {
		path.pop();
		n = treeFrontend.findNode(path) as IDirectory;
	}

	const indexMd = n.children.find((c) => c.path === 'index.md');
	if (indexMd) {
		return [...path, 'index.md'].join('/');
	}

	return undefined;
});

export const isEditing = writable(false);
