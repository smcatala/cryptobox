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
  info(): Cryptoboxes.Config
}

export namespace Cryptoboxes {
  export interface Config {
    url: string
    id: string
  }

  export interface Deps {
    // TBD
  }
}