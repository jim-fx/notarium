import { IDBAdapter, P2PClient } from '@notarium/adapters';
import { createDataBackend, createTree, createTreeStore } from '@notarium/data';

import type { IDataBackend, YNode } from '@notarium/types';
import { derived, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { page } from '$app/stores';
import { browser } from '$app/env';

export const treeBackend = createDataBackend<YNode>('tree', {
	persistanceAdapterFactory: IDBAdapter,
	messageAdapter: P2PClient
});

export const treeStore = createTreeStore(treeBackend);

export const treeFrontend = createTree(treeBackend);

export const isDocumentDir = derived([page], ([p]) => {
	const { editPath } = p.params;
	if (!editPath) return;
	return treeFrontend.isDir(editPath);
});

let docBackend: IDataBackend<string>;
export const documentBackend = derived([isDocumentDir, page], ([isDir, p]) => {
	if (isDir) return;
	const { editPath: path } = p.params;
	if (!path) return undefined;
	if (docBackend) docBackend.close();
	if (path && browser) {
		docBackend = createDataBackend<string>(path, {
			persistanceAdapterFactory: IDBAdapter,
			messageAdapter: P2PClient
		});
		docBackend.load();
		return docBackend;
	}
});

export const directoryStore = derived([treeStore, page], ([tree, p]) => {
	console.log('findDir2', p.params.editPath);
	if (!p?.params?.editPath) return false;
	return treeFrontend.findNode(p.params.editPath);
});

export const hasDocumentIndexMD = derived([documentBackend, isDocumentDir], ([doc, isDir]) => {
	if (!isDir) return false;
	if (!doc) return false;
	if (!doc?.docId) return false;
	console.log('findIndexMd for', doc?.docId);
	const node = treeFrontend.findNode(doc.docId);
	console.log(node);
	return !!treeFrontend.findNode(doc.docId)?.children.find((c) => c.path === 'index.md');
});

export const isEditing = writable(false);
