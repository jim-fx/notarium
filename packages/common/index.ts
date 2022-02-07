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

export * from "./eventlistener";
export * from "./mutex";
export * from "./fs";
