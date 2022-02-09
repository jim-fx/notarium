import * as Y from "yjs";

type IPersistanceAdapterFactory<T> = (
  backend: IDataBackend<T>
) => IPersistanceAdapter;

interface IPersistanceAdapter {
  loadDocument(): Promise<Uint8Array | void>;
  saveDocument(doc: Uint8Array, fromOrigin: Symbol): Promise<void>;
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
  doc: Y.Doc;
  docId: string;

  load(path?: string): Promise<void>;
  update(cb: (data: T) => void, origin: Symbol): void;
  close(): void;

  /**
   * For passing options to any adapters
   */
  flags?: {
    [key: string]: unknown;
    ROOT_PATH?: string;
  };
}

export {
  IDataBackend,
  IMessageAdapter,
  IPersistanceAdapter,
  IPersistanceAdapterFactory,
};
