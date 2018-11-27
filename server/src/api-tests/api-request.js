import request from 'request-promise-native'
import util from 'util'

const setTimeoutPromise = util.promisify(setTimeout)

let totalFailedRequests = 0

// Attempt to send a request to the API server, called again
// with a timeout if it fails to respond.
function tryRequest(opts, retriesLeft) {
  let promise = request(opts)

  if (retriesLeft > 1) {
    promise = promise.catch((error) => {
      if (!error.cause || !(error.cause.code === 'ECONNREFUSED' || error.cause.code === 'ECONNRESET') {
        return Promise.reject(error)
      }

      totalFailedRequests += 1
      if (totalFailedRequests > 100) {
        return Promise.reject(error)
      }

      return setTimeoutPromise(200)
        .then(() => tryRequest(opts, retriesLeft - 1))
    })
  }

  return promise
}

// Perform a request to API endpoint `path`, `extraOpts` are passed as-is
// to the `request` package.
export default function apiRequest(path, extraOpts) {
  const port = process.env.APP_SERVER_PORT || '8080'
  const opts = {
    uri: `http://localhost:${port}${path}`,
    json: true,
    ...extraOpts,
  }

  return tryRequest(opts, 20)
}

