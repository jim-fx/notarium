import * as Y from "yjs";
import type { EventEmitter } from "@notarium/common";

export interface EventMap {
  connect: string;
  disconnect: string;
  "doc.open": { path: string; stateVector: string };
  "doc.close": { path: string };
  "doc.update": { path: string; update: string };
}

export interface IMessageAdapter {
  sendTo(peerId: string, eventType: string, data?: unknown): void;
  requestFile(path: string): Promise<Uint8Array | void>;
  on: EventEmitter<EventMap>["on"];
  broadcast(eventType: string, data?: unknown): void;
  getId(): string;
  connect(urlOrWs: any): void;
}

export interface IDataBackend {
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
