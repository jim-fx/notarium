import {
  createCachedFactory,
  createEventEmitter,
  logger,
} from "@notarium/common";
import detectMimeType from "@notarium/common/detectMime";
import { MimeType } from "@notarium/types";
import Watcher from "watcher";

interface Event {
  type: string;
  path: string;
  newPath: any;
  mimetype?: MimeType;
  isDirectory?: boolean;
  isSymbolicLink?: boolean;
}

const log = logger("adapt/fs-watcher");

const _FSWatcher = (path: string) => {
  log("init", { path });

  const { on, emit } = createEventEmitter<{ changes: Event[] }>();

  const w = new Watcher(path, {
    recursive: true,
    ignoreInitial: true,
    debounce: 100,
    renameDetection: true,
    ignore: (path) => {
      return !!path.match(/(^|[\/\\])\../);
    },
  });

  let timeout: NodeJS.Timeout;
  let events: Event[] = [];
  function handleEvent(e: string, p: string, s: any, mimetype?: MimeType) {
    if (timeout) clearTimeout(timeout);
    const ev: Event = { type: e, path: p, newPath: s, mimetype };
    events.push(ev);
    emit("changes", events);
    events = [];
  }

  w.on("all", async (event, originalPath, targetPathNext) => {
    const targetPath = originalPath.replace(path, "");
    targetPathNext = targetPathNext?.replace(path, "");

    if (event === "add") {
      const s = await detectMimeType(originalPath);
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
