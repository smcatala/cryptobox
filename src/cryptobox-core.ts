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
import { Observable, Observer } from '@reactivex/rxjs'

/**
 *
 */
class CryptoboxCoreClass implements CryptoboxCore {
  /**
   * @factory
   * @param  {{creds:Creds}} spec
   * @returns {CryptoboxCore}
   */
  static getInstance: CryptoboxCoreFactory = function (spec) {
    return new CryptoboxCoreClass(spec)
  }

  /**
   * @constructor
   * @param  {{creds:Creds}} spec
   */
  constructor (spec: { creds: Creds }) {
    //
  }

  read () {
    return Observable.create((obs: Observer<any>) => obs.complete())
  }
}

/**
 * @factory
 * @param  {{creds:Creds}} spec
 * @returns {CryptoboxCore}
 */
export const getCryptoboxCore: CryptoboxCoreFactory =
CryptoboxCoreClass.getInstance

export interface CryptoboxCoreFactory {
  (spec: { creds: Creds }): CryptoboxCore
}

export interface CryptoboxCore {
  read (): Observable<any>
}

export interface Creds {
    id: string;
    secret: string;
}