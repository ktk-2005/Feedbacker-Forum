import request from 'request-promise-native'
import util from 'util'

const setTimeoutPromise = util.promisify(setTimeout)

function tryRequest(opts, retriesLeft) {
  let promise = request(opts)

  if (retriesLeft > 1) {
    promise = promise.catch((error) => {
      const time = 3
      return setTimeoutPromise(time * 1000)
        .then(() => tryRequest(opts, retriesLeft - 1))
    })
  }

  return promise
}

export default function apiRequest(path, extraOpts) {
  const opts = {
    uri: `http://localhost:8080${path}`,
    json: true,
    ...extraOpts
  }

  return tryRequest(opts, 3)
}

