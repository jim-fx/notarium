import { MimeType } from "@notarium/types";
import type { Doc } from "yjs";
import type { EventEmitter } from "@notarium/common";
import { IFile } from "types";

export interface DataCore {
  update(
    cb: (d: Doc | Uint8Array) => Promise<void> | void,
    originalAdapter?: Symbol
  ): Promise<void>;
  getData(): Promise<Doc | Uint8Array>;
  destroy(): void;
}

export interface File {
  path: string;
  mimetype: MimeType;
  readonly isCRDT: boolean;
  isLoaded: Promise<any>;

  on: EventEmitter<{}>["on"];

  mutex(): Promise<() => void>;

  getData(): Uint8Array | Doc;
  getBinaryData(): Promise<Uint8Array>;

  read(): Promise<unknown>;
  load(): Promise<unknown>;
  close(): void;
  update(
    cb: (data: Uint8Array | Doc) => Promise<void> | void,
    adapter?: Symbol
  ): Promise<void>;
}

export type AdapterFactory = (fs: FileSystem) => Adapter | Promise<Adapter>;

export interface Adapter {
  id: Symbol;
  saveFile(file: File, update?: any): Promise<void>;
  requestFile(file: File): Promise<void | Uint8Array>;
  closeFile(file: File): Promise<void>;
  on: EventEmitter<{}>["on"];
}

export interface FileSystemFlags {
  rootPath?: string;
  autoOpen?: boolean;
}

export interface FileSystem {
  isLoaded: Promise<void>;
  flags: FileSystemFlags;
  adapters: Adapter[];

  openFile(path: string): File;

  findFile(path: string | string[]): IFile;
  renameFile(oldPath: string, newPath: string): IFile;
  createFile(path: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  load(): Promise<void>;
}
