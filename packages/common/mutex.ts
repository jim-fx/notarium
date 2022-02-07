function resolvablePromise(): [Promise<unknown>, (value: unknown) => void] {
  let res: (value: unknown) => void;
  const p = new Promise((r) => (res = r));
  return [p, res];
}

export function createMutexFactory() {
  const que = [];
  return async (task: string = "task") => {
    let [promise, resolve] = resolvablePromise();
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
