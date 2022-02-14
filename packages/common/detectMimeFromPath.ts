import { lookup } from "mime-types";
import { MimeType } from "@notarium/types";

export function detectMimeFromPath(path: string): MimeType {
  if (path.endsWith(".md")) return "text/markdown";
  if (path.endsWith("notarium.yml")) return "nota/config";
  return lookup(path);
}
