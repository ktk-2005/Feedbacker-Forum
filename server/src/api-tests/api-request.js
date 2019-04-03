import request from 'request-promise-native'
import util from 'util'
import errors from 'request-promise-native/errors'
import btoa from 'btoa'


const setTimeoutPromise = util.promisify(setTimeout)

let totalFailedRequests = 0

// Attempt to send a request to the API server, called again
// with a timeout if it fails to respond.
function tryRequest(opts, retriesLeft, shouldFail) {
  let promise = request(opts)

  if (retriesLeft > 1 || shouldFail) {
    promise = promise.catch((error) => {
      if (error.statusCode === 500 && shouldFail) {
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

// Perform a request to API endpoint `path`, `opts` are passed as-is
// to the `request` package.
export default function apiRequest(method, path, body, optsArg) {
  const port = process.env.APP_SERVER_PORT || '8080'
  const opts = optsArg || { }

  const users = opts.users || {
    da776df3: 'sf8a7s',
  }

  const container = opts.container || 'test'

  const authToken = btoa(JSON.stringify(users))

  const reqOpts = {
    uri: `http://localhost:${port}${path}`,
    json: true,
    method,
    body,
    headers: {
      'X-Test-Auth': `${authToken}`,
      Origin: `${container}.localhost`,
    },
    ...(opts.request || {}),
  }
  return tryRequest(reqOpts, 80, opts.fail || false)
}

