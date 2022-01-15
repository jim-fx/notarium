import {
  BinaryDocument,
  BinarySyncState,
  FreezeObject,
  SyncState,
} from "automerge";

interface IPersistanceAdapter<T> {
  loadDocument(
    docId: string,
    fsPath?: string
  ): Promise<T | BinaryDocument | undefined>;
  saveDocument(docId: string, doc: BinaryDocument): Promise<void>;

  loadSyncState(
    peerId: string,
    docId: string
  ): Promise<BinarySyncState | undefined>;
  saveSyncState(
    peerId: string,
    docId: string,
    doc: BinarySyncState
  ): Promise<void>;
}

interface IMessageAdapter {
  sendTo(peerId: string, eventType: string, data: unknown): void;
  on(
    eventType: string,
    cb: (data?: unknown, peerId?: string) => unknown
  ): () => void;
  sendToServer?: (eventType: string, data?: unknown) => void;
  getPeerIds(): string[];
  broadcast(eventType: string, data?: unknown): void;
}

type HandleDefault = (eventType: string, data: unknown) => void;
type HandleData<T> = (eventType: "data", data: T) => void;

interface ISubscriber<T> {
  handle: HandleDefault | HandleData<T>;
}
interface IDataBackend<T> {
  load(path?: string): Promise<T>;
  update(cb: (doc: FreezeObject<T>) => FreezeObject<T> | void): void;
  close(): void;

  _doc: FreezeObject<T>;
  _addSubscriber(sub: ISubscriber<T>): () => void;
}

interface IDataBackendFactory<T> {
  (
    docId: string,
    persistanceAdapter: () => IPersistanceAdapter<T>,
    syncAdapter: IMessageAdapter
  ): IDataBackend<T>;
}

export {
  ISubscriber,
  IDataBackend,
  IDataBackendFactory,
  IMessageAdapter,
  IPersistanceAdapter,
};
