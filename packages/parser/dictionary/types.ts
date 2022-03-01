import type { NotariumBlock } from "../generic/types";

export interface NotariumDictionaryDocument {
  frontmatter: {
    type: "dictionary";
    dictionary?: {
      type?: "verbs" | "adjectives";
    };
  };
  blocks: (NotariumBlock | NotariumWordBlock | NotariumVerbBlock)[];
}

export interface NotariumWordBlock {
  type: "word";
  data: {
    original: string;
    translated: string;
    example?: string;
  };
}

export interface NotariumVerbBlock {
  type: "verb";
  data: {
    conjugations: string[];
    original: string;
    translated: string;
    example?: string;
  };
}
