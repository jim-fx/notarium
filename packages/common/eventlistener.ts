type EventMap = Record<string, any>;

type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export function createEventListener<T extends EventMap>(): Emitter<T> {
  const callbacks: {
    [K in keyof EventMap]?: Array<(p: EventMap[K]) => void>;
  } = {};

  return {
    on(event, cb, options?: { listeners: any[] }) {
      callbacks[event] = (callbacks[event] || []).concat(cb);
      const unsub = () => {
        callbacks[event] = callbacks[event].filter((c) => c !== cb);
      };
      if (options && Array.isArray(options?.listeners))
        options.listeners.push(unsub);
      return unsub;
    },
    emit(eventType, data?: unknown, peerId?: string) {
      if (eventType in callbacks) {
        callbacks[eventType].forEach((cb) => cb(data, peerId));
      }
    },
  };
}
