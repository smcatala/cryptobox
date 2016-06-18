/// <reference path="../src/cryptobox.d.ts" />

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

import proxyquire = require('proxyquire')
import Promise = require('bluebird')
import { TYPES, type } from './support/types'
import { clone, flatMap, setProperty } from './support/helpers'
import { pass, fail } from './support/jasmine-bluebird'

const CONFIG: Config = { url: 'url', agent: 'id' }

const CREDS: Creds = { id: 'id', secret: 'secret' }

describe('Cryptoboxes interface', function () {
  let factory: CryptoboxesFactory
  let cboxes: Cryptoboxes
  let CryptoboxCore: jasmine.Spy & Cryptobox

  beforeEach(function () { // set up CryptoboxCore mock
    CryptoboxCore = <jasmine.Spy & Cryptobox> jasmine.createSpy('CryptoboxCore')
    let CryptoboxMethods = jasmine.createSpyObj('CryptoboxMethods', [
      'read', 'write', 'channel', 'info'
    ])
    Object.keys(CryptoboxMethods)
    .forEach(method => CryptoboxCore[method] = CryptoboxMethods[method])
  })

  beforeEach(function () {
    factory = proxyquire('../src', {
      './cryptobox-core': CryptoboxCore,
      '@noCallThru': true
    })

    cboxes = factory(CONFIG)
  })

  describe('create', function () {
    describe('requires a mandatory credentials: { id: string, secret: string } argument',
    function () {
      let creds: Creds

      beforeEach(function () {
        creds = clone<Creds, Creds>(CREDS)
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
          .map(prop => setProperty(clone(creds), prop)) // delete prop
          .map(arg => (<Function>cboxes.create)(arg)))
        .then(fail(done, 'expected Error'))
        .catch(Promise.AggregateError, errors =>
          (errors.every((err: Error) =>
            (err.message === 'invalid credentials'))
            ? pass(done)() : fail(done)(errors)))
      })

      it('rejects with "invalid credentials" Error when type of a property is invalid',
      function (done) {
        Promise.any(flatMap(Object.keys(creds)
          .map(prop => ({ prop: prop, type: type(creds[prop]) })),
        ctx => Object.keys(TYPES)
          .filter(key => key !== ctx.type)
          .map(key => setProperty(clone(creds), ctx.prop, TYPES[key])))
        .map(arg => (<Function>cboxes.create)(arg)))
        .then(fail(done, 'expected Error'))
        .catch(Promise.AggregateError, errors =>
          (errors.every((err: Error) =>
            (err.message === 'invalid credentials'))
            ? pass(done)() : fail(done)(errors)))
      })
    })

    it('copies the credentials object defensively', function (done) {
      let creds = clone<Creds, Creds>(CREDS)
      cboxes.create(creds)
      .then(cbox => {
        Object.keys(CREDS).forEach(key => creds[key] += '*')
        return cboxes.access(CREDS)
      })
      .then(pass(done))
      .catch(fail(done))
    })

    it('returns an "instanceof" itself, ' +
    'i.e. the constructor of the returned instance is itself',
    function (done) {
      cboxes.create(CREDS)
      .then(cbox => {
        expect(cbox instanceof cboxes.create).toBe(true)
        return Promise.resolve(done())
      })
      .catch(fail(done))
    })

    it('returns an immutable object that implements the Cryptobox interface',
    function (done) {
      const CBOX_API = {
        read: () => {},
        write: () => {},
        channel: () => {},
        info: () => {}
      }
      cboxes.create(CREDS)
      .then(cbox => {
        expect(Object.isFrozen(cbox)).toBe(true) // shallow freeze
        Object.keys(CBOX_API).forEach(prop => {
          expect(type(cbox[prop])).toBe(type(CBOX_API[prop])) // shallow validation
        }) // note that CBOX may have additional properties
        return Promise.resolve(done())
      })
      .catch(fail(done))
    })

    it('rejects with "invalid credentials" Error when a Cryptobox instance already exists for the given creds.id',
    function (done) {
      let creds = clone<Creds, Creds>(CREDS)
      Object.keys(creds)
      .filter(key => key != 'id')
      .forEach(key => creds[key] += '*')

      ;(<Promise<Cryptobox>>cboxes.create(CREDS)) // Bluebird Promise
      .then(cbox => Promise.any([
        cboxes.create(CREDS),
        cboxes.create(creds)
      ]))
      .then(fail(done, 'expected Error'))
      .catch(Promise.AggregateError, errors =>
        (errors.every((err: Error) =>
          (err.message === 'invalid credentials'))
          ? pass(done)() : fail(done)(errors)))
    })

    it('calls the core Cryptobox factory', function (done) {
      cboxes.create(CREDS)
      .then(cbox => {
        expect(CryptoboxCore).toHaveBeenCalled()
        return Promise.resolve(done())
      })
    })
  })

  describe('access', function () {
    let cryptobox: Cryptobox

    beforeEach(function (done) {
      cboxes.create(CREDS)
      .then(cbox => cryptobox = cbox)
      .then(done)
    })

    describe('requires a mandatory credentials: { id: string, secret: string } argument',
    function () {
      let creds: Creds

      beforeEach(function () {
        creds = clone<Creds, Creds>(CREDS)
      })

      it('accepts a credentials: { id: string, secret: string } argument',
      function (done) {
        cboxes.access(creds)
        .then(pass(done))
        .catch(fail(done))
      })

      it('rejects with "invalid credentials" Error when missing', function (done) {
        (<Function>cboxes.access)()
        .then(fail(done, 'expected Error'))
        .catch((err: Error) => ((err.message === 'invalid credentials')
          ? pass(done)() : fail(done)(err.message))
        )
      })

      it('rejects with "invalid credentials" Error when not an object',
      function (done) {
        Promise.any(Object.keys(TYPES)
          .filter(key => key !== 'Object')
          .map(key => (<Function>cboxes.access)(TYPES[key])))
        .then(fail(done, 'expected Error'))
        .catch(Promise.AggregateError, errors =>
          (errors.every((err: Error) =>
            (err.message === 'invalid credentials'))
            ? pass(done)() : fail(done)(errors)))
      })

      it('rejects with "invalid credentials" Error when missing a mandatory property',
      function (done) {
        Promise.any(Object.keys(creds)
          .map(prop => setProperty(clone(creds), prop)) // delete prop
          .map(arg => (<Function>cboxes.access)(arg)))
        .then(fail(done, 'expected Error'))
        .catch(Promise.AggregateError, errors =>
          (errors.every((err: Error) =>
            (err.message === 'invalid credentials'))
            ? pass(done)() : fail(done)(errors)))
      })

      it('rejects with "invalid credentials" Error when type of a property is invalid',
      function (done) {
        Promise.any(flatMap(Object.keys(creds)
          .map(prop => ({ prop: prop, type: type(creds[prop]) })),
        ctx => Object.keys(TYPES)
          .filter(key => key !== ctx.type)
          .map(key => setProperty(clone(creds), ctx.prop, TYPES[key])))
        .map(arg => (<Function>cboxes.access)(arg)))
        .then(fail(done, 'expected Error'))
        .catch(Promise.AggregateError, errors =>
          (errors.every((err: Error) =>
            (err.message === 'invalid credentials'))
            ? pass(done)() : fail(done)(errors)))
      })
    })

    it('returns a previously created Cryptobox instance',
    function (done) {
      cboxes.access(CREDS)
      .then(cbox => {
        expect(cbox).toBe(cryptobox)
        return Promise.resolve(done())
      })
      .catch(fail(done))
    })

    it('rejects with "invalid credentials" Error ' +
    'when there is no Cryptobox instance for the given creds.id',
    function (done) {
      let creds = clone<Creds,Creds>(CREDS)
      creds.id += '*'

      cboxes.access(creds)
      .then(fail(done, 'expected Error'))
      .catch((err: Error) => (err.message === 'invalid credentials')
        ? pass(done)() : fail(done)(err))
    })

    it('rejects with "invalid credentials" Error when the credentials ' +
    'do not match those of the corresponding Cryptobox instance',
    function (done) {
      let creds = clone<Creds, Creds>(CREDS)
      Object.keys(creds)
      .filter(key => key != 'id')
      .forEach(key => creds[key] += '*')

      cboxes.access(creds)
      .then(fail(done, 'expected Error'))
      .catch((err: Error) => (err.message === 'invalid credentials')
        ? pass(done)() : fail(done)(err))
    })
  })
})