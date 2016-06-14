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

import * as Promise from 'bluebird'
import factory, * as Cb from '../src'
import { TYPES, type } from './support/types'
import { clone } from './support/clone'
import { pass, fail } from './support/jasmine-bluebird'

const CONFIG: Cb.Config = { url: 'url', agent: 'id' }

describe('Cryptoboxes interface', function () {
  let cboxes: Cb.Cryptoboxes = factory(CONFIG)

  beforeEach(function () {
    cboxes = factory(CONFIG)
  })

  describe('create', function () {
    describe('requires a mandatory credentials: { id: string, secret: string } argument',
    function () {
      let creds: Cb.Creds

      beforeEach(function () {
        creds = { id: 'id', secret: 'secret' }
      })

      it('accepts a credentials: { id: string, secret: string } argument',
      function (done) {
        cboxes.create(creds)
        .then(pass(done))
        .catch(fail(done))
      })

      it('rejects with "invalid credentials" Error when missing', function (done) {
        (<Function>cboxes.create)()
        .then(fail(done, 'expected Error'))
        .catch((err: Error) => ((err.message === 'invalid credentials')
          ? pass(done)() : fail(done)(err.message))
        )
      })

      it('rejects with "invalid credentials" Error when not an object',
      function (done) {
        Promise.any(Object.keys(TYPES)
          .filter(key => key !== 'Object')
          .map(key => (<Function>cboxes.create)(TYPES[key])))
        .then(fail(done, 'expected Error'))
        .catch(Promise.AggregateError, errors =>
          (errors.every((err: Error) =>
            (err.message === 'invalid credentials'))
            ? pass(done)() : fail(done)(errors)))
      })

      it('rejects with "invalid credentials" Error when missing a mandatory property',
      function (done) {
        Promise.any(Object.keys(creds)
          .map(prop => {
            let arg = clone(creds)
            delete arg[prop]
            return (<Function>cboxes.create)(arg)
          }))
        .then(fail(done, 'expected Error'))
        .catch(Promise.AggregateError, errors =>
          (errors.every((err: Error) =>
            (err.message === 'invalid credentials'))
            ? pass(done)() : fail(done)(errors)))
      })

      it('rejects with "invalid credentials" Error when type of a property is invalid',
      function (done) {
        Promise.any(flatMap(Object.keys(creds), prop => {
          let ok = type(prop)
          return Object.keys(TYPES)
          .filter(key => key !== ok)
          .map(key => {
            let arg = clone(creds)
            arg[prop] = TYPES[key]
            return (<Function>cboxes.create)(arg)
          })
        }))
        .then(fail(done, 'expected Error'))
        .catch(Promise.AggregateError, errors =>
          (errors.every((err: Error) =>
            (err.message === 'invalid credentials'))
            ? pass(done)() : fail(done)(errors)))
      })
    })
  })
})

/**
 * @param  {Array<T>} arr
 * @param  {(x: T) => Array<U>} fn map function that outputs an array
 * for each input value
 * @returns {Array<U>} concatenated array of all output arrays
 */
function flatMap<T, U>(arr: T[], fn: (x: T) => U[]) : U[] {
  return Array.prototype.concat.apply([], arr.map(fn))
//  return array.reduce((map: U[], val: T) => [...map, ...fn(val)], <U[]> [])
}