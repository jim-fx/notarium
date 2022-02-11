import { MimeType } from "@notarium/types";
import { lookup } from "mime-types";
import { lstat } from "fs/promises";
import { Magic, MAGIC_MIME_TYPE } from "mmmagic";

let ma: Magic;

const detectMagicMime = (path: string) => {
  if (!ma) ma = new Magic(MAGIC_MIME_TYPE);
  return new Promise((res) => {
    ma.detectFile(path, (err, result) => {
      if (err) return res(false);
      return res(result);
    });
  });
};

export default async function detectMimeType(path: string): Promise<MimeType> {
  const s = await lstat(path);
  if (s.isDirectory()) return "dir";

  let mime = lookup(path);
  if (mime) return mime;

  mime = await detectMagicMime(path);
  if (mime) return mime;

  return "unknown";
}
