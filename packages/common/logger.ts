interface Logger {
  (...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(err: Error): void;
  disable(): void;
  enable(): void;
  isolate(): void;
}

let filters: string[] = [];
let level = 0;

let longestName = 0;

const scopes = {};
let currentIndex = 0;

const colors = [
  "#00ffff",
  "#f0ffff",
  "#f5f5dc",
  "#000000",
  "#0000ff",
  "#a52a2a",
  "#00ffff",
  "#00008b",
  "#008b8b",
  "#a9a9a9",
  "#006400",
  "#bdb76b",
  "#8b008b",
  "#556b2f",
  "#ff8c00",
  "#9932cc",
  "#8b0000",
  "#e9967a",
  "#9400d3",
  "#ff00ff",
  "#ffd700",
  "#008000",
  "#4b0082",
  "#f0e68c",
  "#add8e6",
  "#e0ffff",
  "#90ee90",
  "#d3d3d3",
  "#ffb6c1",
  "#ffffe0",
  "#00ff00",
  "#ff00ff",
  "#800000",
  "#000080",
  "#808000",
  "#ffa500",
  "#ffc0cb",
  "#800080",
  "#800080",
  "#ff0000",
  "#c0c0c0",
  "#ffffff",
  "#ffff00",
];

const localStorageId = "plant.log.history";
const hasLocalStorage = "localStorage" in globalThis;

const history = hasLocalStorage
  ? localStorageId in localStorage
    ? JSON.parse(localStorage.getItem(localStorageId))
    : []
  : [];

if (hasLocalStorage) {
  level = parseInt(localStorage.getItem("pt-log-level")) || 2;
}

function saveHistory() {
  hasLocalStorage &&
    localStorage.setItem(localStorageId, JSON.stringify(history));
}

const onlyThese: Set<string> = new Set();

function log(scope: string): Logger {
  let enabled = true;

  longestName = Math.max(longestName, scope.length);

  const myIndex = currentIndex;

  scopes[scope] = colors[currentIndex];
  currentIndex++;

  const handleLog = (args: unknown[] | Error, _level: number) => {
    history.push({ scope, args: args[0], level: _level });
    history.length = Math.min(100, history.length);
    saveHistory();
    if (!enabled && _level !== 0) return;
    if (filters.length && !filters.includes(scope)) return;

    // Handle all errors
    if (args instanceof Error) {
      console.error(`[${scope.padEnd(longestName, " ")}]`, args);
      return;
    }

    // Make some logs better to read
    if (_level === 2) {
      if (
        Array.isArray(args) &&
        typeof args[0] === "string" &&
        typeof args[1] === "object"
      ) {
        console.groupCollapsed(
          `%c[${scope.padEnd(longestName, " ")}]`,
          `color: hsl(${myIndex * 30}deg 68% 64%); font-weight: bold;`,
          args[0]
        );
        console.log(...args.slice(1));
        console.groupEnd();
        return;
      } else {
        console.log(
          `%c[${scope.padEnd(longestName, " ")}]`,
          `color: hsl(${myIndex * 30}deg 68% 64%); font-weight: bold;`,
          ...args
        );
      }
    }

    if (_level === 1) {
      console.warn(`[${scope.padEnd(longestName, " ")}]`, ...args);
    }
  };

  const log = (...args: unknown[]) => handleLog(args, 2);

  log.enable = () => {
    enabled = true;
  };
  log.disable = () => {
    enabled = false;
  };

  log.isolate = () => {
    if (onlyThese.has(scope)) {
      onlyThese.delete(scope);
    } else {
      console.log("[log] isolate ", scope);
      onlyThese.add(scope);
    }
    filters = [...onlyThese.keys()];
  };

  log.warn = (...args: []) => handleLog(args, 1);

  log.error = (err: Error) => handleLog(err, 0);

  return log;
}

log.setFilter = (...f: string[]) => {
  filters = f;
};

log.setLevel = (l = 0) => {
  level = l;
  localStorage.setItem("pt-log-level", "" + l);
};

export { log as logger };
