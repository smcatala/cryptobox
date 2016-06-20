/// <reference path="../../typings/index.d.ts" />

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
 * simple mock for PouchDB module.
 * can be called with or without 'new' keyword, as with original pouchdb.
 * @returns {object} a new object instance wih the following spies methods:
 * * get()
 * * put()
 * * bulkDocs()
 * * allDocs()
 */
export const mockPouchDb =
<MockPouchDbConstructor>(jasmine.createSpy('mockPouchDb'))

mockPouchDb.and.callFake(() => jasmine.createSpyObj('db', [
  'get', 'put', 'bulkDocs', 'allDocs' // mock subset
]))

export interface MockPouchDbConstructor extends jasmine.Spy {
  new (name?: string, options?: Object): MockPouchDb
}

export interface MockPouchDb {
  get: jasmine.Spy,
  put: jasmine.Spy,
  bulkDocs: jasmine.Spy,
  allDocs: jasmine.Spy
}