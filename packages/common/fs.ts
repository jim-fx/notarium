export function splitPath(p: string) {
  return p.split("/").filter((v) => v.length);
}

export function findChild(tree: TreeData, n: string) {
  return tree.children?.find((c) => c.path === n);
}
