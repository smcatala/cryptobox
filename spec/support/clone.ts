/**
 * @param  {Object} obj
 * @returns Object shallow clone of {obj}, restricted to enumerable properties.
 */
export function clone<S extends T, T>(obj: S): T {
  return Object.keys(obj).reduce((clone, key) => {
    clone[key] = obj[key]
    return clone
  }, {}) as T
}