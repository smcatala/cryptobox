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
 * @class Lock
 * keep track of lock state, with autolock
 */
export default class Lock {
  private _delay: number
  private _lock: number

  /**
   * @constructor
   * @param  {number} delay in ms until autolock after unlock
   * @returns {this} locked
   */
  constructor (delay: number) {
    this._delay = delay
    this.lock()
  }

  /**
   * @returns {this} locked
   */
  lock (): this {
    this._lock = Date.now()
    return this
  }

  /**
   * @param  {number} delay in ms, optional, until autolock after unlock,
   *  defaults to delay defined at instantiation.
   * @returns {this} unlocked
   */
  unlock (delay?: number): this {
    this._lock = Date.now() + (delay || this._delay)
    return this
  }

  /**
   * @param  {Promise<any>} trigger
   * @param  {number} delay?
   * @returns {Promise<this>} resolves and unlocks
   * when trigger successfully resolves
   */
  unlockWhen (trigger: Promise<any>, delay?: number): Promise<this> {
    return trigger.then(() => this.unlock(delay))
  }

  isLocked (): boolean {
    return Date.now() >= this._lock
  }
}