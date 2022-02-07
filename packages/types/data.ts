import * as Y from "yjs";

interface IPersistanceAdapter {
  loadDocument(docId: string, fsPath?: string): Promise<Uint8Array | void>;
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

  /**
   * For passing options to any adapters
   */
  flags?: {
    [key: string]: unknown;
    ROOT_PATH?: string;
  };
}

export { IDataBackend, IMessageAdapter, IPersistanceAdapter };
