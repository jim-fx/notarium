interface ISyncAdapter {
  sendTo(peerId: string, eventType: string, data: unknown): void;
  on(
    eventType: string,
    cb: (data?: unknown, peerId?: string) => unknown
  ): () => void;
  sendToServer?: (eventType: string, data?: unknown) => void;
  getPeerIds(): string[];
  broadcast(eventType: string, data?: unknown): void;
}

export * from "./tree";
export { ISyncAdapter };
