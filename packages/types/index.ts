export * from "./data";

export interface TreeData {
  path: string;
  children?: TreeData[];
}

export interface DocumentData {
  content: string;
}
