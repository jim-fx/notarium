import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
// Languages import
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";

import MarkdownIt from "markdown-it";
import MarkdownFrontMatter from "markdown-it-front-matter";
import MarkownItCheckboxes from "markdown-it-checkbox"
import MarkdownItHighlight from "markdown-it-highlightjs"
import MarkdownMathjax from "markdown-it-mathjax3";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("typescript", typescript);

const md = new MarkdownIt();

md.use(MarkdownItHighlight, { hljs })
md.use(MarkdownMathjax, { svg: { displayAlign: "left" } });
md.use(MarkdownFrontMatter, () => { });
md.use(MarkownItCheckboxes)

export default (input: string): string => {
  return md.render(input);
};
