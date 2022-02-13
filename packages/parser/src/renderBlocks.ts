import {
  NotariumChecklistBlock,
  NotariumCodeBlock,
  NotariumDocument,
  NotariumHeadingBlock,
  NotariumTableBlock,
  NotariumTextBlock,
} from "./types";

import YAML from "yaml";
import { splitLine } from "./regex";

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

export function renderFrontMatter(d: NotariumDocument) {
  if (!d.frontmatter) return [];
  const keys = Object.keys(d.frontmatter);

  if (keys.length) {
    return ["---", ...splitLine(YAML.stringify(d.frontmatter)), "---"].filter(
      (l) => l.length
    );
  } else {
    return [];
  }
}
