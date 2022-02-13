import * as Y from "yjs";
import type { Emitter } from "@notarium/common";

type IPersistanceAdapterFactory<T> = (
  backend: IDataBackend<T>
) => IPersistanceAdapter;

interface IPersistanceAdapter {
  loadDocument(): Promise<Uint8Array | void>;
  saveDocument(doc: Uint8Array, fromOrigin: Symbol): Promise<void>;
}

export interface EventMap {
  connect: string;
  disconnect: string;
  "doc.open": { docId: string; stateVector: string };
  "doc.close": { docId: string };
  "doc.update": { docId: string; updates: string };
}

interface IMessageAdapter {
  sendTo(peerId: string, eventType: string, data?: unknown): void;
  on: Emitter<EventMap>["on"];
  broadcast(eventType: string, data?: unknown): void;
  getId(): string;
  connect(urlOrWs: any): void;
}

interface IDataBackend<T> {
  doc: Y.Doc;
  docId: string;

  connect(urlOrWs: string): void;
  load(path?: string): Promise<void>;
  isLoaded: Promise<void>;
  update(cb: (data: Y.Doc) => void, origin?: Symbol): void;
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
