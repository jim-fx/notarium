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
  // manipulate nodes
  deleteNode(path: string): unknown;
  createNode(path: string): unknown;

  // manipulate documents (eg. file contents)
  readDocument(docId: string, fsPath?: string): Promise<unknown>;
  writeDocument(docId: string, doc: any): Promise<void>;

  //Read/write Sync data
  getPeerIds(): Promise<string[]>;
  readSyncState(peerId: string): Promise<SyncState>;
  writeSyncState(peerId: string, d: SyncState): Promise<void>;
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
