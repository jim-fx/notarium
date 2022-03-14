import { renderFrontMatter, renderBlock } from "./renderBlocks";

import type { NotariumDocument } from "./types";

export default function renderDocumentToMarkdown(d: NotariumDocument): string {
  if (!d || !d.blocks) return "";
  const frontMatter = renderFrontMatter(d);

  const renderedBlocks = d.blocks.map((b) => renderBlock(b));

  const lines = [
    ...frontMatter,
    ...renderedBlocks
      .map((block) => (Array.isArray(block) ? block : [block]))
      .map((block) => [...block, ""])
      .flat(),
  ];
  console.log("RenderDocument", { renderedBlocks, lines, d });

  return lines.join("\n");
}
