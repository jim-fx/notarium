export function createResolvablePromise<T = unknown>(): [
  Promise<T>,
  (value: T) => void
] {
  let res: (value: T) => void;
  const p = new Promise<T>((r) => (res = r));
  return [p, res];
}

export function createMutexFactory() {
  const que = [];
  return async (task: string = "task") => {
    let [promise, resolve] = createResolvablePromise();
    const a = performance.now();
    que.push({ promise, task });
    console.log("started", task, que.length);
    if (que.length > 1) {
      await que[que.length - 2].promise;
    }

    function finish() {
      clearTimeout(timeout);
      que.shift();
      resolve(null);
      console.log(
        "finished in " + Math.floor(performance.now() - a) + "ms",
        task,
        que.length
      );
    }
    const timeout = setTimeout(() => {
      console.log("timeout", task, que.length);
      finish();
    }, 1000);

    return finish;
  };
}
