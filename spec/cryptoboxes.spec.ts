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
import { CryptoboxesFactory, Cryptoboxes, Cryptobox, Config, Creds } from '../src'
import proxyquire = require('proxyquire')
import Promise = require('bluebird')
import {Observable} from '@reactivex/rxjs'
import { TYPES, type } from './support/types'
import { clone, flatMap, setProperty } from './support/helpers'
import { pass, fail } from './support/jasmine-bluebird'

const CONFIG: Config = { url: 'url', agent: 'id' }

const CREDS: Creds = { id: 'id', secret: 'secret' }

describe('Cryptoboxes interface', function () {
  let cboxes: Cryptoboxes
  let getCryptoboxCore: jasmine.Spy

  beforeEach(function () { // set up CryptoboxCore mock
    const CryptoboxCoreProto = jasmine.createSpyObj('CryptoboxMethods', [
      'read', 'write', 'channel', 'info'
    ])
    const cryptoboxCore = Object.create(CryptoboxCoreProto)
    getCryptoboxCore = jasmine.createSpy('getCryptoboxCore')
    getCryptoboxCore.and.returnValue(cryptoboxCore)
  })

  beforeEach(function () {
    const cb = proxyquire('../src', {
      './cryptobox-core': {
        getCryptoboxCore: getCryptoboxCore
      },
      '@noCallThru': true
    })
    cboxes = cb.getCryptoboxes(CONFIG)
  })

  describe('create', function () {
    describe('enforces argument invariants', function () {
      let creds: Creds

      beforeEach(function () {
        creds = clone<Creds, Creds>(CREDS)
      })

      it('accepts a { id: string, secret: string } credentials argument',
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

      it('rejects with "invalid credentials" Error when a Cryptobox instance ' +
      'already exists for the given creds.id', function (done) {
        Object.keys(creds)
        .filter(key => key != 'id')
        .forEach(key => creds[key] += '*')

        cboxes.create(CREDS)
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

    it('calls the core Cryptobox factory with the frozen credentials copy',
    function (done) {
      let creds = clone<Creds, Creds>(CREDS)
      cboxes.create(creds)
      .then(cbox => {
        let args = getCryptoboxCore.calls.allArgs()
        expect(args.length).toBe(1)
        Object.keys(CREDS).forEach(key => creds[key] += '*')
        expect(args[0]).toEqual([{ creds: CREDS }])
        expect(Object.isFrozen(args[0][0].creds))

        return Promise.resolve(done())
      })
    })

    describe('its return value', function () {
      let cbox: Cryptobox

      beforeEach(function (done) {
        cboxes.create(CREDS)
        .then(_cbox => cbox = _cbox)
        .then(done)
      })

      it('is an "instanceof" cryptoboxes#create', function () {
        expect(cbox instanceof cboxes.create).toBe(true)
      })

      it('is an immutable object that implements the Cryptobox interface',
      function () {
        const CBOX_API = {
          read: () => {},
          write: () => {},
          channel: () => {},
          info: () => {}
        }

        expect(Object.isFrozen(cbox)).toBe(true) // shallow freeze
        Object.keys(CBOX_API).forEach(prop => {
          expect(type(cbox[prop])).toBe(type(CBOX_API[prop])) // shallow validation
        }) // note that CBOX may have additional properties
      })

      it('is locked', function (done) {
        cbox.read()
        .subscribe({
          next: fail(done, 'expected Error, not next'),
          error: (err: Error) => (err.message === 'unauthorized')
            ? pass(done)(): fail(done)(err.message),
          complete: fail(done, 'expected Error, not complete')
        })
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

    describe('enforces argument invariants', function () {
      let creds: Creds

      beforeEach(function () {
        creds = clone<Creds, Creds>(CREDS)
      })

      it('accepts a { id: string, secret: string } credentials argument',
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

      it('rejects with "invalid credentials" Error ' +
      'when there is no Cryptobox instance for the given creds.id',
      function (done) {
        creds.id += '*'

        cboxes.access(creds)
        .then(fail(done, 'expected Error'))
        .catch((err: Error) => (err.message === 'invalid credentials')
          ? pass(done)() : fail(done)(err))
      })

      it('rejects with "invalid credentials" Error when the credentials ' +
      'do not match those of the corresponding Cryptobox instance',
      function (done) {
        Object.keys(creds)
        .filter(key => key != 'id')
        .forEach(key => creds[key] += '*')

        cboxes.access(creds)
        .then(fail(done, 'expected Error'))
        .catch((err: Error) => (err.message === 'invalid credentials')
          ? pass(done)() : fail(done)(err))
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
  })
})