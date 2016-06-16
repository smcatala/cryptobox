/**
 * @param  {Object} obj
 * @param  {string} key
 * @param  {any} val
 * @return {Object} obj with (key, val) property
 */
export function setProperty (obj: Object, key: string, val: any): Object {
  obj[key] = val
  return obj
}

/**
 * @param  {Array<T>} arr
 * @param  {(x: T) => Array<U>} fn map function that outputs an array
 * for each input value
 * @returns {Array<U>} concatenated array of all output arrays
 */
export function flatMap<T, U>(arr: T[], fn: (x: T) => U[]) : U[] {
  return Array.prototype.concat.apply([], arr.map(fn))
//  return array.reduce((map: U[], val: T) => [...map, ...fn(val)], <U[]> [])
}

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