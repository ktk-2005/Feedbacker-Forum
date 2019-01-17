import request from 'request-promise-native'
import util from 'util'
import errors from 'request-promise-native/errors'


const setTimeoutPromise = util.promisify(setTimeout)

let totalFailedRequests = 0

// Attempt to send a request to the API server, called again
// with a timeout if it fails to respond.
function tryRequest(opts, retriesLeft, fail) {
  let promise = request(opts)

  if (retriesLeft > 1 || fail) {
    promise = promise.catch((error) => {
      if (error.statusCode === 500 && fail) {
        return Promise.resolve('Failed')
      }
      if (!(error instanceof errors.RequestError
        || (error instanceof errors.StatusCodeError && error.statusCode === 502))) {
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
export default function apiRequest(path, extraOpts, fail = false) {
  const port = process.env.APP_SERVER_PORT || '8080'
  const opts = {
    uri: `http://localhost:${port}${path}`,
    json: true,
    ...extraOpts,
  }
  return tryRequest(opts, 80, fail)
}

