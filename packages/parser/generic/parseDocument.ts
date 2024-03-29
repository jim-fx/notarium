import { parseBlock } from "./parseBlocks";
import {
  isCheckList,
  isCodeClosing,
  isCodeOpening,
  isFrontMatter,
  isLatexLine,
  isLineHeading,
  isLineTable,
  splitLine,
} from "../regex";

import {
  NotariumBlock,
  NotariumDocument,
  NotariumFrontmatterBlock,
  NotariumRawBlock,
} from "./types";

export function parseLines(lines: string[]): NotariumBlock[] {
  const output: NotariumRawBlock[] = [];
  let currentBlock: NotariumRawBlock = {
    type: "paragraph",
    data: [],
  };

  const close = () => {
    if (!currentBlock.data.length) return;

    if (output[output.length - 1]?.type === "paragraph" && currentBlock.type === "paragraph") {
      output[output.length - 1].data.push("", ...currentBlock.data);
    } else {
      output.push(currentBlock);
    }

    currentBlock = {
      type: "paragraph",
      data: [],
    };
  };

  const add = (line: string) => {
    currentBlock.data.push(line);
  };

  lines.forEach((line) => {
    if (line.trim().length < 1 && currentBlock.type !== "code") {
      close();
    } else {
      if (isLatexLine(line)) {
        if (currentBlock.type === "latex") {
          return close();
        }
        currentBlock.type = "latex";
      } else if (currentBlock.type === "latex") {
        add(line);
      } else if (isFrontMatter(line)) {
        if (currentBlock.type === "frontmatter") close();
        currentBlock.type = "frontmatter";
      } else if (isLineTable(line)) {
        if (currentBlock.type !== "table") close();
        currentBlock.type = "table";
        add(line);
      } else if (isLineHeading(line)) {
        close();
        currentBlock.data = [line];
        currentBlock.type = "heading";
        close();
      } else if (isCheckList(line)) {
        if (currentBlock.type !== "checklist") close();
        currentBlock.type = "checklist";
        add(line);
      } else if (isCodeClosing(line)) {
        add(line);
        close();
      } else if (isCodeOpening(line)) {
        if (currentBlock.type !== "code") close();
        currentBlock.type = "code";
        add(line);
      } else {
        add(line);
      }
    }
  });

  close();

  return output.map((block) => parseBlock(block));
}

export default function parseDocument(input: string): NotariumDocument {
  const lines = splitLine(input);
  if (!lines.length || (lines.length === 1 && lines[0].length === 0))
    return undefined;

  const blocks: NotariumBlock[] = [];
  const frontMatterBlocks: NotariumFrontmatterBlock[] = [];

  for (const b of parseLines(lines)) {
    if (b.type === "frontmatter") {
      frontMatterBlocks.push(b);
    } else {
      blocks.push(b);
    }
  }

  const frontmatter = frontMatterBlocks.reduce((a, b) => {
    return { ...a, ...b.data };
  }, {});

  return {
    frontmatter,
    md: input,
    blocks,
  };
}
