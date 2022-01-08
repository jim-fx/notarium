interface ISyncAdapter {
  broadcast(): void;
  sendTo(peerId: string): void;
  serverSent(): void;
  on(
    eventType: string,
    cb: (data: unknown, peerId?: string) => void
  ): () => void;
}
