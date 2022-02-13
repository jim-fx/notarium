import YAML from "yaml";
import { isLineChecked, isTableSeperator } from "./regex";
import renderMarkdown from "./renderMarkdown";
import { NotariumBlock, NotariumRawBlock } from "./types";

export function parseHeading([line]: string[]) {
  let weight = 1;

  line.startsWith("##") && (weight = 2);
  line.startsWith("###") && (weight = 3);
  line.startsWith("####") && (weight = 4);

  return {
    weight,
    text: line.replace(/^[#]{1,3}\s/, ""),
  };
}

export function parseTable(lines: string[]) {
  const headers = lines
    .shift()
    ?.split("|")
    .map((v) => v.trim())
    .filter((v) => v.length);

  const rows = lines
    .map((line) => {
      if (isTableSeperator(line)) return false;
      return line
        .split("|")
        .map((v) => v.trim())
        .filter((v) => v.length);
    })
    .filter((v) => !!v);

  return {
    headers,
    rows,
  };
}

export function parseCode(lines: string[]) {
  const language = lines.shift()?.replace("```", "").trim();

  // Remove last ``` length
  lines.pop();

  return {
    language,
    text: lines,
  };
}

export function parseChecklist(lines: string[]) {
  return lines.map((v) => {
    return {
      checked: isLineChecked(v),
      text: v.replace(/^(\s*)-\s\[[x\s]\]\s/, ""),
    };
  });
}

export function parseFrontMatter(lines: string[]) {
  const content = lines.join("\n");

  try {
    const res = YAML.parse(content);
    return res;
  } catch (err) {
    return {};
  }
}

export function parseBlock(block: NotariumRawBlock): NotariumBlock {
  const md = (
    Array.isArray(block.data) ? block.data.join("\n") : block.data
  ) as string;
  const html = renderMarkdown(md);

  let data;

  switch (block.type) {
    case "table":
      data = parseTable(block.data);
      break;
    case "heading":
      data = parseHeading(block.data);
      break;
    case "checklist":
      data = parseChecklist(block.data);
      break;
    case "code":
      data = parseCode(block.data);
      break;
    case "frontmatter":
      data = parseFrontMatter(block.data);
      break;
    default:
      data = md;
      break;
  }

  return { type: block.type, md, html, data };
}
