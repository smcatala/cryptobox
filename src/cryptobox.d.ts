/// <reference path="../typings/index.d.ts" />

interface CryptoboxesFactory {
    (config: Config): Cryptoboxes;
}

interface Cryptoboxes {
    create(creds: Creds): Promise<Cryptobox>;
    access(creds: Creds): Promise<Cryptobox>;
    config: Config;
}

interface Cryptobox extends CryptoboxCore {
    cryptoboxes: Cryptoboxes;
}

interface CryptoboxCore {
  read (): void
}

interface Config {
    url: string;
    agent: string;
}

interface Creds {
    id: string;
    secret: string;
}