export * from "./data";
import type { Array, Map } from "yjs";

export type MimeType =
  | "tree"
  | "dir"
  | "unknown"
  | "text/markdown"
  | "nota/theme"
  | "image/jpg"
  | "image/png"
  | "image/svg"
  | "application/pdf";

export type IFile = IContentFile | IDirectory | IBinary;

interface IBinary {
  mimetype: Exclude<
    MimeType,
    "dir" | "text/markdown" | "nota/theme" | "image/svg"
  >;
}

interface IContentFile {
  path: string;
  mimetype: Exclude<MimeType, "dir">;
}

export interface IDirectory {
  path: string;
  mimetype: "dir";
  children: IFile[];
}

export interface YNode extends Map<Array<YNode> | string> {
  get(key: "children"): Array<YNode>;
  set(key: "children", value: Array<YNode>): string | Array<YNode>;
  get(key: "mimetype"): MimeType;
  set(key: "mimetype", value: MimeType): string;
  get(key: "path"): string;
  set(key: "path", value: string): string;
}

export type MaybeArray<T> = T | T[];
