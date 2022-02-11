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

export function createCachedFactory<
  T extends (...args: unknown[]) => ReturnType<T>
>(
  func: T,
  getId: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => ReturnType<T> {
  const cache: Record<string, ReturnType<T>> = {};

  return (...args: Parameters<T>) => {
    const id = getId(...args);
    if (cache[id]) return cache[id];
    cache[id] = func(...args);
    return cache[id];
  };
}

export function assureArray<T>(v: T | T[]) {
  return Array.isArray(v) ? v : [v];
}

export * from "./eventlistener";
export * from "./mutex";
export * from "./fs";
