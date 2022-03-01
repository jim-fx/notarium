import { Parser } from "../types";
import { NotariumDictionaryDocument } from "./types";
import parseDocument from "./parseDocument";
import renderDocument from "./renderDocument";

export const DictionaryParser: Parser<NotariumDictionaryDocument> = {
  parse: parseDocument,
  render: renderDocument,
};
