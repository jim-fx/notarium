interface TreeData {
  path: string;
  children?: TreeData[];
}

interface ITreeAdapterCreator {
  (tree: Tree): ITreeAdapter;
}

interface ITreeAdapterCreatorPartial {
  (tree: Tree): Partial<ITreeAdapterCreator>;
}

interface ITreeAdapter {
  read(path?: string): Promise<Uint8Array>;
  write?: (data: TreeData) => Promise<void>;

  // Directly manipulate the tree
  deleteNode(path: string): unknown;
  createNode(path: string): unknown;

  //Read/write Sync data
  getPeerIds(): Promise<string[]>;
  readSyncData(peerId: string): Promise<unknown>;
  writeSyncData(peerId: string, d: unknown): Promise<unknown>;
}

interface ISyncAdapter {
  sendTo(peerId: string, eventType: string, data: unknown): void;
  on(
    eventType: string,
    cb: (data?: unknown, peerId?: string) => unknown
  ): () => void;
  sendToServer(eventType: string, data?: unknown);
  broadcast(eventType: string, data?: unknown);
}

interface ITreeSyncMessage {
  type: "open" | "sync";
  peerId: string;
  docId: string;
  data: UInt8Array;
}

interface Tree {
  findNode(path: string): TreeNode;
  deleteNode(path: string): void;
  createNode(path: string, content?: string): void;

  getTree(): TreeData;

  load(): Promise<void>;

  _on(eventType: string, data: unknown);
  _emit(eventType: string, data: unknown);
  _addAdapter(adapter: ITreeAdapterCreatorPartial): void;
  _pushChangesToAdapters(adapter?: ReturnType<ITreeAdapter>);
}
