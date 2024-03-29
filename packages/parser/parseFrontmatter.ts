import { matchFrontmatter } from "./regex";
import pkg from "yaml";
const { parse } = pkg;

export function parseFrontmatter(markdown: string) {
  const frontmatter = matchFrontmatter(markdown);
  if (!frontmatter) return {};
  try {
    return parse(frontmatter);
  } catch (err) {
    return {};
  }
}
