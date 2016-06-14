/**
 * key-value map of type to sample value of corresponding type.
 * types: 'string', 'number', 'function', 'NaN', 'undefined',
 * 'Null', 'Date', 'RegExp', 'Array', 'Object'
 */
export const TYPES = [
  '42', 42, () => 42, NaN, undefined, null,
  new Date(), new RegExp('42'), [ 42 ], { '42': 42 }
].reduce((types, val) => {
  types[type(val)] = val
  return types
}, {})

/**
 * @param  {any} val
 * @returns string type of {val},
 * one of 'string', 'number', 'NaN', 'function', 'undefined',
 * 'Null', 'String', 'Number', 'Date', 'RegExp', 'Array', 'Object'
 */
export function type (val: any): string {
  let p = typeof val
  if (p !== 'object') return (val !== val) ? 'NaN' : p
  if (Array.isArray(val)) return 'Array'
  return Object.prototype.toString.call(val).match(/[A-Z]\w+/)[0]
}