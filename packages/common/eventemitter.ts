type EventMap = Record<string | "destroy", any>;

type EventKey<T extends EventMap> = string & keyof T;

type MaybeAsync<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => ReturnType<T> | Promise<ReturnType<T>>;

type EventReceiver<T> = MaybeAsync<
  (params: T, stuff?: Record<string, any>) => unknown
>;

export interface EventEmitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(
    eventName: K,
    params?: T[K],
    stuff?: Record<string, any>
  ): void;
  createChildEmitter: () => EventEmitter<T>;
  destroy: () => void;
}

export function createEventEmitter<T extends EventMap>(): EventEmitter<T> {
  const callbacks: {
    [K in keyof EventMap]?: Array<
      (p: EventMap[K], stuff?: Record<string, any>) => void
    >;
  } = {};

  const children: EventEmitter<T>[] = [];

  const emitter: EventEmitter<T> = {
    on(event, cb) {
      callbacks[event] = (callbacks[event] || []).concat(cb);
      return () => {
        callbacks[event] = callbacks[event].filter((c) => c !== cb);
      };
    },
    emit<K extends EventKey<T>>(
      eventType: K,
      data?: EventMap[K],
      stuff?: Record<string, any>
    ) {
      if (eventType in callbacks) {
        callbacks[eventType].forEach((cb) => cb(data, stuff));
      }
      children.forEach((c) => c.emit(eventType, data, stuff));
    },
    destroy() {},
    createChildEmitter() {
      const emitter = createEventEmitter<T>();
      children.push(emitter);
      emitter.on("destroy", () => {
        const i = children.findIndex((c) => c === emitter);
        if (i !== -1) {
          children.splice(i, 1);
        }
      });
      return emitter;
    },
  };

  return emitter;
}
