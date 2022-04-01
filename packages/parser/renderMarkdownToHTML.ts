import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
// Languages import
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";

import MarkdownIt from "markdown-it";
import MarkdownFrontMatter from "markdown-it-front-matter";
import MarkdownLatex from "@iktakahiro/markdown-it-katex";
import MarkdownMathjax from "markdown-it-mathjax3";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("typescript", typescript);

const md = new MarkdownIt({
  highlight: function (str: string, language: string) {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(str, { language }).value;
      } catch (err) {
        /*"asdasd"*/
      }
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {
      /*asdasd*/
    }

    return ""; // use external default escaping
  },
});

// md.use(MarkdownLatex, { fleqn: true });
md.use(MarkdownMathjax, { svg: { displayAlign: "left" } });
md.use(MarkdownFrontMatter, () => {});

export default (input: string): string => {
  return md.render(input);
};
