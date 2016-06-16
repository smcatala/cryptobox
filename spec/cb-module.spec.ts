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

import factory, { Config } from '../src'
import { TYPES, type } from './support/types'
import { clone, flatMap, setProperty } from './support/helpers'

const CONFIG: Config = { url: 'url', agent: 'id' }

describe('cryptobox module', function () {
  it('exports a function', function () {
    expect(typeof factory).toBe("function")
  })

  describe('exported function', function () {
    describe('requires a mandatory config: { url: string, agent: string } argument',
    function () {
      let config: Config

      beforeEach(function () {
        config = clone<Config,Config>(CONFIG)
      })

      it('accepts a config: { url: string, agent: string } argument', function () {
        expect(() => factory(config)).not.toThrowError()
      })

      it('throws when missing', function () {
        expect(factory).toThrowError('invalid argument')
      })

      it('throws when not an object', function () {
        Object.keys(TYPES)
        .filter(key => key !== 'Object')
        .forEach(key => {
          expect(() => (<Function>factory)(TYPES[key]))
          .toThrowError('invalid argument')
        })
      })

      it('throws when missing a mandatory property', function () {
        Object.keys(config)
        .map(prop => setProperty(clone(config), prop]))
        .forEach(arg => expect(() => (<Function>factory)(arg))
          .toThrowError('invalid argument'))
      })

      it('throws when type of a property is invalid', function () {
        flatMap(Object.keys(config)
          .map(prop => ({ prop: prop, type: type(config[prop]) })),
        ctx => Object.keys(TYPES)
          .filter(key => key !== ctx.type)
          .map(key => setProperty(clone(config), ctx.prop, TYPES[key])))
        .forEach(arg => expect(() => (<Function>factory)(arg))
          .toThrowError('invalid argument'))
      })
    })
  })

  it('copies the config object argument defensively', function () {
    let arg = clone<Config, Config>(CONFIG)
    let cboxes = factory(arg)
    Object.keys(arg).forEach(key => {
      delete arg[key]
      expect(cboxes.config[key]).toEqual(CONFIG[key])
    })
  })

  it('returns an immutable object that implements the Cryptoboxes interface',
  function () {
    const CBOXES_API = {
      create: () => {},
      access: () => {},
      config: {}
    }
    const CBOXES = factory(CONFIG)
    expect(Object.isFrozen(CBOXES)).toBe(true) // shallow freeze
    Object.keys(CBOXES_API).forEach(prop => {
      expect(type(CBOXES[prop])).toBe(type(CBOXES_API[prop])) // shallow validation
    })
    // note that CBOXES may have additional properties
  })
})