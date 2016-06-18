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

import factory = require('../src')
import Promise = require('bluebird')
import { Observable } from '@reactivex/rxjs'
import { TYPES, type } from './support/types'
import { clone, flatMap, setProperty } from './support/helpers'
import { pass, fail } from './support/jasmine-bluebird'

const CONFIG: Config = { url: 'url', agent: 'id' }

const CREDS: Creds = { id: 'id', secret: 'secret' }

describe('core Cryptobox interface', function () {
  let cbox: Cryptobox
  beforeEach(function (done) {
    factory(CONFIG).create(CREDS)
    .then(_cbox => cbox = _cbox)
    .then(done)
  })

  describe('read', function () {
  })
})