import * as p2p from "./src/client";
export * from "./src/client";

if ("window" in globalThis) {
  window["p2p"] = p2p;
}

export default p2p;
