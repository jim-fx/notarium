import { BinaryDocument, BinarySyncState, SyncState } from "automerge";

interface IPersistanceAdapter<T> {
  loadDocument(docId: string): Promise<T | BinaryDocument | undefined>;
  saveDocument(docId: string, doc: BinaryDocument): Promise<void>;

  saveSyncState(peerId: string, docId: string, doc: SyncState): Promise<void>;
  loadSyncState(peerId: string, docId: string): Promise<SyncState | undefined>;
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

interface IDataBackend<T> {
  load(): Promise<T>;
  update(cb: (doc: T) => void): void;
  close(): void;
}

interface IDataBackendFactory<T> {
  (
    docId: string,
    persistanceAdapter: IPersistanceAdapter<T>,
    syncAdapter: IMessageAdapter
  ): IDataBackend<T>;
}

export {
  IDataBackend,
  IDataBackendFactory,
  IMessageAdapter,
  IPersistanceAdapter,
};
