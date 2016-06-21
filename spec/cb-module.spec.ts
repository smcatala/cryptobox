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
;
import { getCryptoboxes as factory, Cryptoboxes, Config } from '../src'
import assign = require('object-assign')
import { TYPES, type } from './support/types'
import { clone, flatMap, setProperty } from './support/helpers'

const CONFIGS = {
  min: <Config>{ url: 'url', agent: 'id' },
  opts: { autolock: 900000 }
}

describe('cryptobox module', function () {
  it('exports a function', function () {
    expect(typeof factory).toBe("function")
  })

  describe('exported function', function () {
    let configs: { min: Config, max: Config }

    beforeEach(function () {
      configs = {
        min: assign(<Config>{}, CONFIGS.min),
        max: assign(<Config>{}, CONFIGS.min, CONFIGS.opts)
      }
    })

    describe('enforces argument invariants', function () {
      it('accepts a { url: string, agent: string } config argument', function () {
        expect(() => factory(configs.min)).not.toThrowError()
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

      it('throws when missing any of the mandatory ["url", "agent"] properties',
      function () {
        Object.keys(configs.min)
        .map(prop => setProperty(assign({}, configs.min), prop)) // delete prop
        .forEach(arg => expect(() => (<Function>factory)(arg))
          .toThrowError('invalid argument'))
      })

      it('throws when type of a mandatory property is invalid', function () {
        flatMap(Object.keys(configs.min)
          .map(prop => ({ prop: prop, type: type(configs.min[prop]) })),
        ctx => Object.keys(TYPES)
          .filter(key => key !== ctx.type)
          .map(key => setProperty(assign({}, configs.max), ctx.prop, TYPES[key])))
        .forEach(arg => expect(() => (<Function>factory)(arg))
          .toThrowError('invalid argument'))
      })
    })

    it('copies the config object argument defensively', function () {
      let config: Config = assign(<Config>{}, configs.max)
      let cboxes = factory(config)
      Object.keys(config).forEach(key => config[key] += '*')
      expect(cboxes.config).toEqual(configs.max)
    })

    describe('its return value', function () {
      let cboxes: Cryptoboxes

      beforeEach(function () {
        cboxes = factory(configs.min)
      })

      it('is an immutable object', function () {
        expect(Object.isFrozen(cboxes)).toBe(true) // shallow freeze
      })

      it('implements the Cryptoboxes interface', function () {
        const CBOXES_API = {
          create: () => {},
          access: () => {},
          config: {}
        }
        Object.keys(CBOXES_API).forEach(prop => {
          expect(type(cboxes[prop])).toBe(type(CBOXES_API[prop])) // shallow validation
        })
        // note that CBOXES may have additional properties
      })
    })
  })
})