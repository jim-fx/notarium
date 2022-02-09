import { createCachedFactory, createEventListener } from "@notarium/common";
import { lstat } from "fs/promises";
import Watcher from "watcher";

interface Event {
  type: string;
  path: string;
  newPath: any;
  isDirectory?: boolean;
  isSymbolicLink?: boolean;
}

const _FSWatcher = (path: string) => {
  console.log("watcher:init", path);

  const { on, emit } = createEventListener<{ changes: Event[] }>();

  const w = new Watcher(path, {
    recursive: true,
    ignoreInitial: true,
    debounce: 10,
    renameDetection: true,
    ignore: (path) => {
      return !!path.match(/(^|[\/\\])\../);
    },
  });

  let timeout: NodeJS.Timeout;
  let events: Event[] = [];
  function handleEvent(
    e: string,
    p: string,
    s: any,
    stat?: Awaited<ReturnType<typeof lstat>>
  ) {
    if (timeout) clearTimeout(timeout);
    const ev = { type: e, path: p, newPath: s };
    if (stat) {
      ev["isDirectory"] = stat.isDirectory();
      ev["isSymbolicLink"] = stat.isSymbolicLink();
    }
    events.push(ev);
    timeout = setTimeout(() => {
      emit("changes", events);
      events = [];
    }, 20);
  }

  w.on("all", async (event, originalPath, targetPathNext) => {
    const targetPath = originalPath.replace(path, "");
    targetPathNext = targetPathNext?.replace(path, "");

    if (event === "add") {
      const s = await lstat(originalPath);
      handleEvent(event, targetPath, targetPathNext, s);
    } else {
      handleEvent(event, targetPath, targetPathNext);
    }
  });

  return {
    on,
  };
};

export const FSWatcher = createCachedFactory(_FSWatcher, (p) => p);
