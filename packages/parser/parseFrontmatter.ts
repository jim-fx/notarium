import { matchFrontmatter } from "./regex";
import { parse } from "yaml";

export function parseFrontmatter(markdown: string) {
  const frontmatter = matchFrontmatter(markdown);
  if (!frontmatter) return false;
  try {
    return parse(frontmatter);
  } catch (err) {
    return false;
  }
}
