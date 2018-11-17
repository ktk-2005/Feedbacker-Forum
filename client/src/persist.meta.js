const meta = require('./meta/meta-util')
const env = meta.eval(require('./meta/env.meta'))

const storageName = env.staticUrl.replace(/[^A-Za-z0-9]/g, '')
const storageKey = `FeedbackerForum_${storageName}`
const storageCookieRegex = `${storageKey}\\s*=(\\s*[A-Za-z0-9-_.!~*'()]+)`

module.exports = meta.code(`{
  storageKey: '${storageKey}',
  storageCookieRegex: /${storageCookieRegex}/,
}`)
