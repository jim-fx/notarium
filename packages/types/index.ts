export * from "./data";
import * as Y from "yjs";

export interface TreeData {
  path: string;
  children?: TreeData[];
}

export interface YNode extends Y.Map<Y.Array<YNode> | string> {
  get(key: "children"): Y.Array<YNode>;
  get(key: "path"): string;
  get(key: string): unknown;
}

export type MaybeArray<T> = T | T[];
export function assureArray<T>(v: T | T[]) {
  return Array.isArray(v) ? v : [v];
}
