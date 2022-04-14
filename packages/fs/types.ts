import { MimeType } from "@notarium/types";
import type { Doc } from "yjs";
import type { EventEmitter } from "@notarium/common";
import { IFile } from "types";
import { createContext } from "./createContext";

export interface DataCore {
  update(
    cb: (d: Doc | Uint8Array) => Promise<void> | void,
    originalAdapter?: Symbol
  ): Promise<void>;
  getData(): Doc | Uint8Array;
  destroy(): void;
}

export interface File {
  path: string;
  mimetype: MimeType;
  readonly isCRDT: boolean;
  isLoaded: Promise<any>;

  on: EventEmitter<{ update: void; context: Record<string, any> }>["on"];

  mutex(): Promise<() => void>;

  stuff: Record<string, any>;

  getData(): Uint8Array | Doc;
  getBinaryData(): Promise<Uint8Array>;

  getContext(): ReturnType<typeof createContext>;

  load(): Promise<unknown>;
  close(): void;
  update(
    cb: (data: Uint8Array | Doc) => Promise<void> | void,
    adapter?: Symbol
  ): Promise<void>;

  toJSON(): { context: ReturnType<File["getContext"]>, mimetype: File["mimetype"], text?: string }
}

export type AdapterFactory = (fs: FileSystem) => Adapter | Promise<Adapter>;

export interface Adapter {
  id: Symbol;
  saveFile(file: File, update?: any): Promise<void>;
  requestFile(file: File): Promise<void | Uint8Array>;
  closeFile(file: File): Promise<void>;
}

export interface FileSystemFlags {
  rootPath?: string;
  autoOpen?: boolean;
}

export interface FileSystem {
  isLoaded: Promise<void>;
  flags: FileSystemFlags;
  adapters: Adapter[];

  load(): Promise<void>;
  openFile(path: string): File;

  setOffline(o: boolean): void;

  listFiles(): string[];
  isDir(path: string | string[]): boolean;
  findFile(path: string | string[]): IFile;
  renameFile(oldPath: string, newPath: string): void;
  createFile(path: string, mimetype?: MimeType): void;
  deleteFile(path: string): void;
}
