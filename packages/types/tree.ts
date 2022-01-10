import {
  BinaryDocument,
  BinarySyncState,
  FreezeObject,
  SyncState,
} from "automerge";

interface TreeData {
  path: string;
  children?: TreeData[];
}

interface ITreeAdapterFactory<T = ITreeAdapter> {
  (tree: Tree): T;
}

interface ITreeAdapter {
  // Directly manipulate the tree
  readTree(path?: string): Promise<BinaryDocument | TreeData | null>;

  /**
   * Only use for in memory saving
   */
  writeTree?: (tree: TreeData) => void;

  // manipulate nodes
  deleteNode(path: string): unknown;
  createNode(path: string): unknown;

  // manipulate documents (eg. file contents)
  readDocument(path: string): unknown;
  writeDocument(path: string): unknown;

  //Read/write Sync data
  getPeerIds(): Promise<string[]>;
  readSyncData(peerId: string): Promise<BinarySyncState | undefined>;
  writeSyncData(peerId: string, d: SyncState): Promise<void>;
}

interface Tree {
  findNode(path?: string): FreezeObject<TreeData>;
  deleteNode(path: string): void;
  createNode(path: string, content?: string): void;

  load(path?: string): Promise<void>;

  _addAdapter(adapter: ITreeAdapterFactory<Partial<ITreeAdapter>>): void;
  _pushChangesToAdapters(adapter?: ITreeAdapter): void;
}

export { Tree, TreeData, ITreeAdapter, ITreeAdapterFactory };
