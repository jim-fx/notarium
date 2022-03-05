import { createCachedFactory } from "@notarium/common";
import { IPersistanceAdapterFactory } from "@notarium/types";
import * as ucan from "ucans";

globalThis["ucan"] = ucan;

interface Options {
  persistanceAdapter: ReturnType<IPersistanceAdapterFactory>;
}

let adapter: ReturnType<typeof _createAuth>;
export function createAuth(options: Options) {
  if (adapter) return adapter;
  adapter = _createAuth(options);
  return adapter;
}

async function _createAuth({
  persistanceAdapter: IPersistanceAdapter,
}: Options) {
  return {};
}

export default () => {};
