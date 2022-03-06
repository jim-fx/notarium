import { IDBAdapter, P2PClient, createNetworkAdapter } from '@notarium/adapters';
import { createTreeStore, createTree } from '@notarium/data';

import type { IDirectory } from '@notarium/types';
import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import { browser } from '$app/env';
import { splitPath, detectMimeFromPath } from '@notarium/common';

import fs from '../fs';

export const treeStore = createTreeStore(fs);

export const activeNodeId = derived([page], ([p]) => {
	return p.params?.editPath;
});

export const activeMimeType = derived([activeNodeId], ([p]) => {
	return detectMimeFromPath(p);
});

export const activeNode = derived([activeNodeId, treeStore], ([id]) => {
	if (!id) return undefined;
	return fs.findNode(id);
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

let _isEditing = false;
let _editorType = 'text';

if (browser && window.location.hash) {
	const [type, editing] = window.location.hash.replace('#', '').split('.');
	_editorType = type || 'text';
	_isEditing = editing === 'edit';
}

export const isEditing = writable(_isEditing);
export const editorType = writable(_editorType);

function setHash(type = _editorType, edit = _isEditing) {
	if (browser) {
		window.location.hash = _editorType + (_isEditing ? '.edit' : '');
	}
}

isEditing.subscribe((v) => {
	setHash(undefined, v);
});

editorType.subscribe((v) => {
	setHash(v, undefined);
});

export * as localStore from './localStore';
