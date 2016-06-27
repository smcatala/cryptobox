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
import Promise = require('bluebird')
const PouchDB = require('pouchdb') // TODO clarify status of typings

/**
 * TODO replace this placeholder
 * Database abstraction and encryption layer
 */
class AccountsClass implements Accounts {
  /**
   * @returns {Accounts} singleton
   * @error {PouchError}
   */
  static getAccounts (spec?: AccountsSpec): Accounts {
    const db = AccountsClass._getPouchDB('accounts')
    return AccountsClass._accounts = new AccountsClass(db)
  }

  create (specs: AccountSpec): Promise<PendingAccount> {
    return Promise.resolve(<PendingAccount> {
      id: specs.id,
      accountUrl: 'account-url',
      dbUrl: 'db-url'
    })
  }

  /**
   * TODO implementation
   * @see Accounts#get
   */
  get (specs: AccountSpec): Promise<PendingAccount|Account> {
    return Promise.resolve(<PendingAccount> {
      id: specs.id,
      accountUrl: 'account-url',
      dbUrl: 'db-url'
    })
  }

  /**
   * TODO implementation
   * @see Accounts#put
   */
  put (account: Account): Promise<Account> {
    return Promise.resolve(account)
  }

  /**
   * @private
   * @constructor
   * @param  {Object} db
   */
  constructor (db: Promise<any>) {
    this._db = db
  }

  /**
   * @singleton
   */
  private static _accounts: Accounts

  /**
   * @param  {string} id
   * @param  {Object} opts?
   * @returns {Promise<any>} // TODO return type Promise<PouchDB>
   * PouchDB instance of an existing or new Pouch database
   * @error {PouchError}
   */
  private static _getPouchDB =
  (id: string, opts?: Object): Promise<any> =>
    Promise.try(() => new PouchDB(id, opts));

  private _db: Object // TODO clarify type
}

export const getAccounts: AccountsFactory = AccountsClass.getAccounts

export interface Accounts {
  /**
   * @param  {AccountSpec} specs
   * @returns {Promise<PendingAccount>}
   * @error 'UNAUTHORIZED' when an account already exists for the given id
   */
  create (specs: AccountSpec): Promise<PendingAccount>

  /**
   * @param  {AccountSpec} specs
   * @returns {Promise<PendingAccount|Account>}
   * @error 'UNAUTHORIZED' when no account exists for the given specs
   */
  get (specs: AccountSpec): Promise<PendingAccount|Account>

  /**
   * @param  {Account} account
   * @returns {Promise<Account>}
   */
  put (account: Account): Promise<Account>
}

export interface AccountsFactory {
  (spec?: AccountsSpec): Accounts
}

export interface AccountsSpec {
  // TODO
}

export interface PendingAccount {
  id: string
  accountUrl: string // url of user account endpoint
  dbUrl: string // url of couchDB host endpoint
}

export interface Account extends PendingAccount {
  // TODO
}

export interface AccountSpec {
  id: string
  key: Object // TODO openpgp
}

/**
 * encrypted Account object
 */
interface CyphAccount {
  /**
   * encrypted id
   */
  id: string
  /**
   * encrypted Account JSON
   */
  cyph: string
}