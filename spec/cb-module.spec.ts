/// <reference path="../typings/index.d.ts" />

/**
 * Copyright 2016 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */

import { default as factory, Cryptoboxes as Cbxs } from '../src'

const CONFIG: Cbxs.Config = { url: 'url', id: 'id' }

describe('cryptobox module', function () {
  it('exports a function', function () {
    expect(typeof factory).toBe("function")
  })

  describe('exported function', function () {
    describe('requires a mandatory config: { url: string, id: string } argument',
    function () {
      let mandatory: Cbxs.Config

      beforeEach(function () {
        mandatory = CONFIG
      })

      it('accepts a config: { url: string, id: string } argument', function () {
        expect(() => factory(mandatory)).not.toThrowError()
      })

      it('throws when missing', function () {
        expect(factory).toThrowError('missing mandatory config object argument')
      })

      it('throws when not an object', function () {
        Object.keys(TYPES)
        .filter(key => key !== 'Object')
        .forEach(key => {
          expect(() => (factory as any)(TYPES[key]))
          .toThrowError('invalid config argument type: expected Object, not ${key}')
        })
      })

      it('throws when missing a mandatory property', function () {
        Object.keys(mandatory)
        .forEach(prop => {
          let arg = clone(mandatory)
          delete arg[prop]
          expect(() => (factory as any)(arg))
          .toThrowError('invalid config object argument: ' +
          'missing mandatory property ${prop}')
        })
      })

      it('throws when type of a property is invalid', function () {
        Object.keys(mandatory)
        .forEach(prop => {
          let ok = type(prop)
          Object.keys(TYPES)
          .filter(key => key !== ok)
          .forEach(key => {
            let arg = clone(mandatory)
            arg[prop] = TYPES[key]
            expect(() => (factory as any)(arg))
            .toThrowError('invalid config object argument: ' +
            'expected property "${prop}" of type ${ok}, not ${key}')
          })
        })
      })
    })

    it('copies the config object argument defensively', function () {
      let arg = clone(CONFIG) as Cbxs.Config
      let cboxes = factory(arg)
      Object.keys(arg).forEach(key => {
        delete arg[key]
        expect(cboxes.info()[key]).toEqual(CONFIG[key])
      })
    })

    it('returns an immutable object that implements the Cryptoboxes interface',
    function () {
      const CBOXES_API = {
        info: () => {}
      }
      const CBOXES = factory(CONFIG)
      expect(Object.isFrozen(CBOXES)).toBe(true)
      Object.keys(CBOXES_API).forEach(prop => {
        expect(type(CBOXES[prop])).toBe(type(CBOXES_API[prop]))
      })
      // note that CBOXES may have additional properties
    })
  })
})

/**
 * key-value map of type to sample value of corresponding type.
 * types: 'string', 'number', 'function', 'NaN', 'undefined',
 * 'Null', 'Date', 'RegExp', 'Array', 'Object'
 */
const TYPES = [
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
function type (val: any): string {
  let p = typeof val
  if (p !== 'object') return (val !== val) ? 'NaN' : p
  if (Array.isArray(val)) return 'Array'
  return Object.prototype.toString.call(val).match(/[A-Z]\w+/)[0]
}

/**
 * @param  {Object} obj
 * @returns Object shallow clone of {obj}, restricted to enumerable properties.
 */
function clone<S extends T, T>(obj: S): T {
  return Object.keys(obj).reduce((clone, key) => {
    clone[key] = obj[key]
    return clone
  }, {}) as T
}