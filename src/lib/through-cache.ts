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
/**
 * @private
 * @class Cache
 * bare-bones (key, value) through-cache based on ES2015-Map
 */
export default class Cache<K,V> {
  private _cache: Map<K,V>
  private _get: Getter<K,V>

  /**
   * @constructor
   */
  constructor (get: (key: K) => V) {
    this._get = get
  }

  /**
   * @param  {string} key
   * @param  {Getter<T>} get? defaults to Getter supplied for instantiation
   * @returns {T} instance from cache or else with Getter or else undefined
   */
  get (key: K, get?: Getter<K,V>): V {
    return this._cache.get(key) || this.put(key, (get || this._get)(key))
  }

  /**
   * @param  {K} key
   * @returns {boolean} true if instance for key is cached
   */
  has (key: K): boolean {
    return this._cache.has(key)
  }

  /**
   * store given (key, val) entry in cache if val is defined, i.e. not falsy
   * @param  {string} key
   * @param  {T} val
   * @returns {T} val or undefined if val is falsy
   */
  put (key: K, val: V): V {
    if (!val) return
    this._cache.set(key, val)
    return val
  }
}

export interface Getter<K, V> {
  (key: K): V
}