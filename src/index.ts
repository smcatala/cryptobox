/**
 * Factory of instances of the Cryptoboxes interface
 * @param  {Cryptoboxes.Config} config
 * @param  {Cryptoboxes.Deps} deps?
 * @returns Cryptoboxes
 */
export default
function factory (config: Cryptoboxes.Config, deps?: Cryptoboxes.Deps):
Cryptoboxes {
  // TODO
  return
}

export interface Cryptoboxes {
  /**
   * Provide configuration information of this Cryptoboxes instance
   *
   * @return {Object} immutable clone of the configuration object
   * supplied to the factory of this Cryptoboxes instance
   */
  info(): Cryptoboxes.Config
}

export namespace Cryptoboxes {
  /**
   * Configuration object for Cryptoboxes,
   * e.g. supplied as argument to the Cryptoboxes factory,
   * or returned by the Cryptoboxes#info method
   */
  export interface Config {
    url: string
    id: string
  }

  /**
   * Dependencies object for Cryptoboxes,
   * supplied as argument to the Cryptoboxes factory to override defaults
   */
  export interface Deps {
    // TBD
  }
}