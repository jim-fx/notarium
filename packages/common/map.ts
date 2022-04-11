/**
 * Get map property. Create T if property is undefined and set T on map.
 *
 * ```js
 * const listeners = map.setIfUndefined(events, 'eventName', set.create)
 * listeners.add(listener)
 * ```
 */
export const setIfUndefined = <T, K>(
  map: Map<K, T>,
  key: K,
  createT: () => T
): T => {
  let set = map.get(key);
  if (set === undefined) {
    map.set(key, (set = createT()));
  }
  return set;
};
