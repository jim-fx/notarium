import { MimeType } from "@notarium/types";
import type { Doc } from "yjs";
import type { EventEmitter } from "@notarium/common";
import { IFile } from "types";

export interface File {
  path: string;
  mimetype: MimeType;
  readonly isCRDT: boolean;
  isLoaded: boolean;

  on: EventEmitter<{}>["on"];

  getData(): Promise<Uint8Array | Doc>;

  read(): Promise<unknown>;
  load(): Promise<unknown>;
  close(): void;
  update(cb: (data: unknown) => Promise<void>): Promise<void>;
}

export type AdapterFactory = (fs: FileSystem) => Adapter | Promise<Adapter>;

export interface Adapter {
  saveFile(file: File, update?: any): Promise<void>;
  requestFile(file: File): Promise<unknown>;
  closeFile(file: File): Promise<void>;
  on: EventEmitter<{}>["on"];
}

export interface FileSystem {
  rootPath: string;
  adapters: Adapter[];
  on: undefined;
  tree: undefined;

  openFile(path: string): Promise<File>;

  findFile(path: string): Promise<IFile>;
  renameFile(oldPath: string, newPath: string): Promise<void>;
  createFile(path: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  load(): Promise<void>;
}
