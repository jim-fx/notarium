import { createTree, indexDBAdapter, createSvelteStore } from '@notarium/tree';

const tree = createTree(indexDBAdapter, p2p);

const store = createSvelteStore(tree);

export { tree, store };

export default tree;
