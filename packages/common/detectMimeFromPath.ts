import { MimeType } from "@notarium/types";

export function detectMimeFromPath(path: string): MimeType {
  if (path === "tree") return "tree";
  if (path.endsWith(".md")) return "text/markdown";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg")) return "image/jpg";
  if (path.endsWith("notarium.css")) return "nota/theme";
  if (path.endsWith("/") || !path.includes(".")) return "dir";
  return "unknown";
}
