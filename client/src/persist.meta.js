const meta = require('./meta/meta-util')
const env = meta.eval(require('./meta/env.meta'))

const storageCookieRegex = `${env.storageKey}\\s*=(\\s*[A-Za-z0-9-_.!~*'()]+)`

module.exports = meta.code(`{
  storageCookieRegex: /${storageCookieRegex}/,
}`)
