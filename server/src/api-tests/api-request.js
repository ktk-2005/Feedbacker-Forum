import request from 'request-promise-native'
import util from 'util'

const setTimeoutPromise = util.promisify(setTimeout)

// Attempt to send a request to the API server, called again
// with a timeout if it fails to respond.
function tryRequest(opts, retriesLeft) {
  let promise = request(opts)

  if (retriesLeft > 1) {
    promise = promise.catch(() => {
      const time = 3
      return setTimeoutPromise(time * 1000)
        .then(() => tryRequest(opts, retriesLeft - 1))
    })
  }

  return promise
}

// Perform a request to API endpoint `path`, `extraOpts` are passed as-is
// to the `request` package.
export default function apiRequest(path, extraOpts) {
  const opts = {
    uri: `http://localhost:8080${path}`,
    json: true,
    ...extraOpts
  }

  return tryRequest(opts, 3)
}

