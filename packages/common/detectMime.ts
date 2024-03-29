import { MimeType } from "@notarium/types";
// import { lstat } from "node:fs/promises";
// import { Magic, MAGIC_MIME_TYPE } from "mmmagic";

// let ma: Magic;

import { detectMimeFromPath } from "./detectMimeFromPath";

// const detectMagicMime = (path: string) => {
//   if (!ma) ma = new Magic(MAGIC_MIME_TYPE);
//   return new Promise((res) => {
//     ma.detectFile(path, (err, result) => {
//       if (err) return res(false);
//       return res(result);
//     });
//   });
// };

export default async function detectMimeType(path: string): Promise<MimeType> {
  const { lstat } = await import("node:fs/promises");

  if (lstat) {
    const s = await lstat(path);
    if (s.isDirectory()) return "dir";
  }

  let mime = detectMimeFromPath(path);
  if (mime && mime !== "unknown") return mime;

  // mime = (await detectMagicMime(path)) as MimeType;
  // if (mime) return mime;

  return "unknown";
}
