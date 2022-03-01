export interface NotariumDocument {
  frontmatter: {
    type?: string;
    [key: string]: any;
  };
  blocks: NotariumBlock[];
  md: string;
}

export interface NotariumRawBlock {
  type: NotariumBlock["type"];
  data: string[];
}

interface DefNotariumBlock {
  md: string;
  html: string;
}

export type NotariumBlock =
  | NotariumTextBlock
  | NotariumHeadingBlock
  | NotariumCodeBlock
  | NotariumTableBlock
  | NotariumChecklistBlock
  | NotariumFrontmatterBlock;

export interface NotariumFrontmatterBlock extends DefNotariumBlock {
  type: "frontmatter";
  data: Record<string, any>;
}

export interface NotariumTextBlock extends DefNotariumBlock {
  type: "paragraph";
  data: string[];
}

export interface NotariumHeadingBlock extends DefNotariumBlock {
  type: "heading";
  data: {
    weight: number;
    text: string;
  };
}

export interface NotariumChecklistBlock extends DefNotariumBlock {
  type: "checklist";
  data: {
    checked: boolean;
    text: string;
  }[];
}

export interface NotariumCodeBlock extends DefNotariumBlock {
  type: "code";
  data: {
    language: string;
    text: string[];
  };
}

export interface NotariumTableBlock extends DefNotariumBlock {
  type: "table";
  data: {
    headers: string[];
    rows: string[][];
  };
}
