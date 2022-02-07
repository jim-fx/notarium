import Watcher from "watcher";
import { lstat } from "fs/promises";
import { createEventListener } from "@notarium/common";

interface Event {
  type: string;
  path: string;
  newPath: any;
}

const watcherStore: { [path: string]: ReturnType<typeof FSWatcher> } = {};

export function FSWatcher(path: string) {
  if (path in watcherStore) {
    return watcherStore[path];
  }

  console.log("watcher:init", path);

  const { on, emit } = createEventListener();

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

  const returnObj = {
    on,
  };

  watcherStore[path] = returnObj;

  return returnObj;
}
