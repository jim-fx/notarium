import parseDocument from "./parseDocument";
import renderDocument from "./renderDocument";
import type { Parser } from "../types";

export * from "./parseBlocks";
export * from "./renderBlocks";

import { NotariumDocument } from "./types";

export const GenericParser: Parser<NotariumDocument> = {
  render: renderDocument,
  parse: parseDocument,
};
