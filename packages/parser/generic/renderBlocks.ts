import {
  NotariumChecklistBlock,
  NotariumCodeBlock,
  NotariumDocument,
  NotariumHeadingBlock,
  NotariumTableBlock,
  NotariumTextBlock,
} from "../types";

import YAML from "yaml";
import { splitLine } from "../regex";
import { NotariumBlock, NotariumLatexBlock } from "./types";

export function renderChecklist(b: NotariumChecklistBlock) {
  return b.data.map((v) => `- [${v.checked ? "x" : " "}] ${v.text}`);
}

export function renderParagraph(b: NotariumTextBlock) {
  const data = (b.data || b.md) as string | string[];
  return Array.isArray(data) ? data : data.split("\n");
}

export function renderHeading(b: NotariumHeadingBlock) {
  return [`${new Array(b.data.weight).fill("#").join("")} ${b.data.text}`];
}

export function renderTableLine(
  line: string[],
  maxWidths: number[],
  padder = " "
) {
  return `| ${line
    .map((c, x) => {
      return c.padEnd(Math.max(c.length, maxWidths[x]), padder);
    })
    .join(" | ")} |`;
}

export function renderTable(b: NotariumTableBlock): string[] {
  const { headers, rows } = b.data;

  const maxWidths = headers.map((v) => v.length);

  rows.map((row) => {
    row.map((col, x) => {
      maxWidths[x] = Math.max(maxWidths[x] ? maxWidths[x] : 0, col.length);
    });
  });

  const header = renderTableLine(headers, maxWidths);

  const seperator = renderTableLine(
    headers.map(() => "-"),
    maxWidths,
    "-"
  );

  const _rows = rows.map((row) => renderTableLine(row, maxWidths));

  return [header, seperator, ..._rows];
}

export function renderCode(d: NotariumCodeBlock) {
  return ["```" + d.data.language, ...d.data.text, "```"];
}

export function renderLatex(b: NotariumLatexBlock) {
  console.log("RenderLatex", b);
  return ["$$", ...b.data, "$$"];
}

export function renderBlock(b: NotariumBlock) {
  switch (b.type) {
    case "table":
      return renderTable(b);
    case "heading":
      return renderHeading(b);
    case "checklist":
      return renderChecklist(b);
    case "code":
      return renderCode(b);
    case "paragraph":
      return renderParagraph(b);
    case "latex":
      return renderLatex(b);
    default:
      console.error("Need to implement render for type", b.type);
      return [];
  }
}

export function renderFrontMatter(d: NotariumDocument) {
  if (!d.frontmatter) return [];
  const keys = Object.keys(d.frontmatter);

  const lines = splitLine(YAML.stringify(d.frontmatter));

  console.log("RenderFrontmatter", { lines, keys, d });

  if (keys.length) {
    return ["---", ...lines, "---"].filter((l) => l.length);
  } else {
    return [];
  }
}
