import type { NotariumVerbBlock, NotariumWordBlock } from "./types";

import type { NotariumBlock } from "../generic/types";

import * as regex from "../regex";

export function parseVerbBlocks(inputBlocks: NotariumBlock[]) {
  type Block = NotariumBlock | NotariumVerbBlock;

  let currentBlock: Block = {
    type: "verb",
    data: {
      conjugations: [],
      original: "",
      translated: "",
    },
  };

  const blocks: Block[] = [];

  const empty = JSON.stringify(currentBlock);
  function close() {
    if (JSON.stringify(currentBlock) === empty) return;
    blocks.push(currentBlock);
    currentBlock = JSON.parse(empty);
  }

  let nextBlockIsExample = false;

  for (const b of inputBlocks) {
    if (b.type === "heading") {
      if (b?.data.weight === 2 && b.data.text.includes(" - ")) {
        close();

        const [orig, translated] = b.data.text.split(" - ");

        currentBlock.type = "verb";
        currentBlock.data["original"] = orig;
        currentBlock.data["translated"] = translated;

        continue;
      } else if (
        b?.data.weight === 3 &&
        ["ejemplo", "example"].includes(b.data?.text.toLowerCase())
      ) {
        nextBlockIsExample = true;
        continue;
      }
    }

    if (b.type === "paragraph") {
      if (currentBlock.type === "verb") {
        if (nextBlockIsExample) {
          nextBlockIsExample = false;
          currentBlock.data["example"] = b.data.toString();
        } else {
          currentBlock.data.conjugations = regex.splitLine(b.data.toString());
        }
        continue;
      }
    }

    currentBlock = b;
    close();
  }
  close();

  return blocks;
}

export function parseGenericDictionaryBlocks(inputBlocks: NotariumBlock[]) {
  type Block = NotariumWordBlock | NotariumBlock;
  const blocks: Block[] = [];

  let currentBlock = {
    type: "word",
    data: {
      original: "",
      translated: "",
    },
  } as Block;

  const empty = JSON.stringify(currentBlock);
  function close() {
    if (JSON.stringify(currentBlock) === empty) return;
    blocks.push(currentBlock);
    currentBlock = JSON.parse(empty);
  }

  for (const b of inputBlocks) {
    if (
      b.type === "heading" &&
      b?.data.weight === 2 &&
      b.data.text.includes(" - ")
    ) {
      const [orig, translated] = b.data.text.replace(/\t/g, " ").split(" - ");
      currentBlock.type = "word";
      currentBlock.data["original"] = orig;
      currentBlock.data["translated"] = translated;
      close();
      continue;
    }

    if (b.type === "paragraph") {
      const lines = regex.splitLine(
        regex.replaceTabsWithSpaces(b.data.toString())
      );

      for (const line of lines) {
        if (line.includes(" - ")) {
          currentBlock.type = "word";
          const [orig, translated] = line.replace(/\t/g, " ").split(" - ");
          currentBlock.data = {
            translated: translated?.trim(),
            original: orig?.trim(),
          };
          close();
        } else {
          currentBlock.type = "paragraph";
          currentBlock.data = [line];
          close();
        }
      }
      continue;
    }

    currentBlock = b;
    close();
  }

  close();

  return blocks;
}
