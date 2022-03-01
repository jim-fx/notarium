export function parseBinary(s: string) {
  return Uint8Array.from(s.split(",").map((v) => parseInt(v)));
}

export const parseCookie = (str: string) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

export const wait = (num = 500) => new Promise((res) => setTimeout(res, num));

export const delayExecution = (
  cb: (ids: string[]) => void,
  time: number = 2000
) => {
  const ids = new Set<string>();
  let timeout: NodeJS.Timeout;
  return (id: string) => {
    if (!timeout)
      timeout = setTimeout(async () => {
        timeout = null;
        cb([...ids.values()]);
        ids.clear();
      }, time);
    ids.add(id);
  };
};

function defaultExtractId(...args: unknown[]) {
  const [arg0] = args;
  if (typeof arg0 === "string") {
    return arg0;
  }

  if (typeof arg0 === "object") {
    if ("docId" in arg0) {
      return arg0["docId"];
    }

    if ("id" in arg0) {
      return arg0["id"];
    }
  }

  throw new Error("Need to add getId function for cachedFactory");
}

const caches = [];
export function createCachedFactory<
  T extends (...args: unknown[]) => ReturnType<T>
>(
  func: T,
  getId: (...args: Parameters<T>) => string = defaultExtractId
): (...args: Parameters<T>) => ReturnType<T> {
  const cache: Record<string, ReturnType<T>> = {};
  caches.push(cache);
  return (...args: Parameters<T>) => {
    const id = getId(...args);
    if (cache[id]) return cache[id];
    cache[id] = func.call(
      {
        destroy: () => {
          delete cache[id];
        },
      },
      ...args
    );
    return cache[id];
  };
}

export function assureArray<T>(v: T | T[]) {
  return Array.isArray(v) ? v : [v];
}

export * from "./eventlistener";
export * from "./mutex";
export * from "./fs";

export * from "./logger";
export * from "./detectMimeFromPath";
export { default as mergeObjects } from "./mergeObjects";
