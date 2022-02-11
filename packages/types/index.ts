export * from "./data";
import * as Y from "yjs";

export type MimeType = "dir" | "text/markdown" | "unknown";

export type IFile = IContentFile | IDirectory;

interface IContentFile {
  path: string;
  mimetype: Exclude<MimeType, "dir">;
}

export interface IDirectory {
  path: string;
  mimetype: "dir";
  children: IFile[];
}

export interface YNode extends Y.Map<Y.Array<YNode> | string> {
  get(key: "children"): Y.Array<YNode>;
  set(key: "children", value: Y.Array<YNode>): string | Y.Array<YNode>;
  get(key: "mimetype"): MimeType;
  set(key: "mimetype", value: MimeType): string;
  get(key: "path"): string;
  set(key: "path", value: string): string;
}

export type MaybeArray<T> = T | T[];
