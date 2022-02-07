export function splitPath(p: string | string[]) {
  if (Array.isArray(p)) return p;
  return p.split("/").filter((v) => v.length);
}
