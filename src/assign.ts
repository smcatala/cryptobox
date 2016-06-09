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

// Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
const assign: Assign = function assign <Z, A>(target: Z, source: A): Z & A {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  let dst = <Z & A>Object(target)
  for (let index = 1; index < arguments.length; index++) {
    let src = arguments[index]
    if (src != null) { // neither null nor undefined
      for (let key in src) {
        if (Object.prototype.hasOwnProperty.call(src, key)) {
          dst[key] = src[key]
        }
      }
    }
  }
  return dst
}

export default <Assign>(('assign' in Object) ? (<any>Object).assign : assign)

export interface Assign {
  <Z,A>(target: Z, source: A): Z & A
  <Z,A,B>(target: Z, a: A, b: B): Z & A & B
  <Z,A,B,C>(target: Z, a: A, b: B, c: C): Z & A & B & C
  <Z,A,B,C,D>(target: Z, a: A, b: B, c: C, d: D): Z & A & B & C & D
  <Z,A,B,C,D,E>(target: Z, a: A, b: B, c: C, d: D, e: E): Z & A & B & C & D & E
  (target: any, ...sources: any[]): any
}