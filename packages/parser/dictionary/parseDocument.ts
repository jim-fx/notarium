import { parseVerbBlocks, parseGenericDictionaryBlocks } from "./parseBlocks";
import { GenericParser } from "../generic";
import type { NotariumDictionaryDocument } from "./types";

export default function parseDocument(s: string): NotariumDictionaryDocument {
  const doc = GenericParser.parse(s);

  let blocks: NotariumDictionaryDocument["blocks"];

  switch (doc?.frontmatter?.dictionary?.type) {
    case "verbs":
      blocks = parseVerbBlocks(doc.blocks);
      break;
    default:
      blocks = parseGenericDictionaryBlocks(doc.blocks);
  }

  return { ...doc, ...{ blocks: blocks } } as NotariumDictionaryDocument;
}
