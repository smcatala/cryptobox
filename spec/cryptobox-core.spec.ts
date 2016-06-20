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
import { Observable } from '@reactivex/rxjs'
import { TYPES, type } from './support/types'
import { clone, flatMap, setProperty } from './support/helpers'
import { pass, fail } from './support/jasmine-bluebird'

const CONFIG: Config = { url: 'url', agent: 'id' }

const CREDS: Creds = { id: 'id', secret: 'secret' }

interface MockDb {
  get: jasmine.Spy,
  put: jasmine.Spy,
  bulkDocs: jasmine.Spy,
  allDocs: jasmine.Spy
}

interface MockPouch {
  new (name?: string, options?: Object): MockDb
}

describe('core Cryptobox interface', function () {
  let PouchDB: MockPouch
  let db: MockDb
  let cbox: Cryptobox

  beforeEach(function () { // set up PouchDB mock
    db = jasmine.createSpyObj('db', [
      'get', 'put', 'bulkDocs', 'allDocs' // mock subset
    ])
    PouchDB = <any>(jasmine.createSpy('PouchDB').and.returnValue(db))
  })

  beforeEach(function (done) {
    let factory: CryptoboxesFactory = proxyquire('../src', {
      'pouchdb': PouchDB,
      '@noCallThru': true // error on methods not mocked
    })

    factory(CONFIG).create(CREDS)
    .then(_cbox => cbox = _cbox)
    .then(done)
  })

  describe('read', function () {
    it('returns a completed Observable when called without arguments',
    function () {
      let res: any = cbox.read()
      expect(res instanceof Observable).toBe(true) // placeholder: instanceof is not reliable
    })
  })
})