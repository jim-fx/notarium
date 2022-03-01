import * as GenericParser from "./generic";
import * as DictionaryParser from "./dictionary";

export function getParser(type: string) {
  if (type === "dictionary") return DictionaryParser;
  return GenericParser;
}
