import * as Y from "yjs";

interface IPersistanceAdapter {
  loadDocument(docId: string, fsPath?: string): Promise<Uint8Array | undefined>;
  saveDocument(docId: string, doc: Uint8Array): Promise<void>;
}

interface IMessageAdapter {
  sendTo(peerId: string, eventType: string, data?: unknown): void;
  on(
    eventType: string,
    cb: (data?: unknown, peerId?: string) => unknown,
    options?: { listeners: any[] }
  ): () => void;
  broadcast(eventType: string, data?: unknown): void;
  getId(): string;
  connect(urlOrWs: any): void;
}

interface IDataBackend<T> {
  docId: string;
  doc: Y.Doc;
  load(path?: string): Promise<void>;
  update(cb: (data: T) => void): void;
  close(): void;
}

interface IDataBackendFactory<T> {
  (
    docId: string,
    persistanceAdapter: (backend: IDataBackend<T>) => IPersistanceAdapter,
    syncAdapter: IMessageAdapter
  ): IDataBackend<T>;
}

export {
  IDataBackend,
  IDataBackendFactory,
  IMessageAdapter,
  IPersistanceAdapter,
};
