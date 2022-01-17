export function createEventListener() {
  const callbacks: Record<
    string,
    ((data: unknown, peerId?: string) => void)[]
  > = {};

  function on(
    event: string,
    cb: (data: unknown, peerId?: string) => void,
    options?: { listeners: any[] }
  ): () => void {
    callbacks[event] = event in callbacks ? [...callbacks[event], cb] : [cb];
    const unsub = () => {
      callbacks[event] = callbacks[event].filter((c) => c !== cb);
    };
    if (options && Array.isArray(options?.listeners))
      options.listeners.push(unsub);
    return unsub;
  }

  function emit(eventType: string, data?: unknown, peerId?: string) {
    if (eventType in callbacks) {
      callbacks[eventType].forEach((cb) => cb(data, peerId));
    }
  }

  return {
    on,
    emit,
  };
}
