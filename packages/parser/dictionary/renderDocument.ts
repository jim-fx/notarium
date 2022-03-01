import { renderBlock, renderFrontMatter } from "../generic";

import type { NotariumDictionaryDocument } from "./types";

export default function renderDocument(doc: NotariumDictionaryDocument) {
  const res: string[] = [];

  if (doc.frontmatter) {
    res.push(...renderFrontMatter(doc), "");
  }

  for (const b of doc.blocks) {
    if (b.type === "verb") {
      res.push("");

      res.push(`## ${b.data.original} - ${b.data.translated}`);

      res.push(...b.data.conjugations);

      if (b.data.example) {
        res.push("### example");
        res.push(b.data.example);
      }
    } else if (b.type === "word") {
      res.push("");
      res.push(`${b.data.original} - ${b.data.translated}`);
    } else {
      res.push("");
      res.push(...renderBlock(b));
    }
  }

  return res.join("\n");
}
