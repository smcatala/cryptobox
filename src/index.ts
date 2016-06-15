/// <reference path="../typings/index.d.ts" />
import assign = require('object-assign')
import * as Promise from 'bluebird'

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

/**
 * @public
 * @factory
 * @param {url: string, id: string} config
 * @return {Cryptoboxes}
 * @throws Error 'invalid credentials' when
 * - creds is not a valid credentials object {url: string, id: string}
 * - or a cryptobox instance already exists for the given creds.id
 */
export default function (config: Config): Cryptoboxes {
  if (!isConfig(config)) {
    throw new Error('invalid argument')
  }

  interface AccessPool<T> {
    [index: string]: Authorizer<T>
  }

  interface Authorizer<T> {
    (creds: Creds): Promise<T>
  }

  let _pool = <AccessPool<Cryptobox>>Object.create(null) // TODO should be local pouchdb instances

  /**
   * TODO this is a placeholder/skeleton concept study
   * @public
   * @factory
   * @param {id: string, secret: string} creds
   * @return {Promise<Cryptobox>} resolves to a new immutable instance
   * for the given creds,
   * or to an 'invalid credentials' Error when
   * - creds is not a valid credentials object
   * - or a cryptobox instance already exists for the given creds.id
   */
  function Cryptobox (creds: Creds): Promise<Cryptobox> {
    if (!isCreds(creds) || (creds.id in _pool)) {
      return Promise.reject(new Error('invalid credentials'))
    }

    let _creds = Object.freeze({ // defensive copy
      id: creds.id,
      secret: creds.secret // TODO PBKDF2(creds.secret)
    })

    let core = (<Function>CryptoboxCore)() // default to factory call

    let cryptobox: Cryptobox = Object.create(Cryptobox.prototype)

    /**
     * authorization decorator
     */
    cryptobox.read = function () {
      if (!isLocked()) return // an Observable Error
      return core.read()
    }

    // TODO decorators for write, channel, info

    cryptobox = Object.freeze(cryptobox)

    let _lock: number

    function unlock () {
      _lock = Date.now() + 900000 // 15min
    }

    function isLocked () {
      return Date.now() < _lock
    }

    _pool[_creds.id] = function access (creds: Creds): Promise<Cryptobox> {
      if (!isCreds(creds) || (creds.id !== _creds.id)
      || (creds.secret !== _creds.secret)) { // TODO PBKDF2(creds.secret)
        return Promise.reject(new Error('invalid credentials'))
      }

      unlock()

      return Promise.resolve(cryptobox)
    }

    return Promise.resolve(cryptobox)
  }

  /**
   * @public
   * @param {id: string, secret: string} creds
   * @return {Promise<Cryptobox>} resolves to the Cryptobox for given creds
   * or to an 'invalid credentials' Error when
   * - creds is not a valid credentials object
   * - or there is no cryptobox instance for the given creds.id
   * - or creds does not match that of the corresponding cryptobox instance
   */
  function getCryptobox (creds: Creds): Promise<Cryptobox> { // TODO should return a Promise
    if (!isCreds(creds) || !(creds.id in _pool)) {
      return Promise.reject(new Error('invalid credentials'))
    }

    return _pool[creds.id](creds)
  }

  return Cryptobox.prototype.cryptoboxes = Object.freeze({
    create: Cryptobox,
    access: getCryptobox,
    config: Object.freeze(assign({}, config)) // defensive copy
  })
}

export interface Config {
  url: string
  agent: string
}

export interface Creds {
  id: string,
  secret: string
}

export interface Cryptoboxes {
  create (creds: Creds): Promise<Cryptobox>
  access (creds: Creds): Promise<Cryptobox>
  config: Config
}

export interface Cryptobox {
  read (): void // placeholder
  cryptoboxes: Cryptoboxes
}

/**
 * @private
 * @param {id: string, secret: string} creds
 * @return {boolean} true if creds is a valid credentials object
 */
function isCreds(creds: any): creds is Creds {
  return creds && (typeof creds.id === 'string')
    && (typeof creds.secret === 'string')
}

/**
 * @private
 * @param {url: string, id: string} config
 * @return {boolean} true if config is a valid Config object
 */
function isConfig(config: any): config is Config {
  return config && (typeof config.url === 'string')
    && (typeof config.agent === 'string')
}

// placeholder
class CryptoboxCore {
  /**
   * @factory
   */
  constructor () {
    return Object.create(CryptoboxCore.prototype)
  }
  read () {}
}