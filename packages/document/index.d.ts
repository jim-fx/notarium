interface DocumentData {
  path: string;
  content: string;
}

interface IDocumentAdapter {
  constructor(cb: (eventType: string, data: unknown) => void): IDocumentAdapter;

  read(): DocumentData;
  write(data: Partial<DocumentData>): Promise<void>;

  readSyncData(peerId: string, docId: string): unknown;
  writeSyncData(peerId: string, docId: string, syncData: unknown);
}

interface Document {
  setTitle: () => void;
  setType: () => void;
  setContent: () => void;
}
