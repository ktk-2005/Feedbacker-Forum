import { toast } from 'react-toastify'
import { apiUrl } from './meta/env.meta'
import { waitForUsers, subscribeUsers, unsubscribeUsers, updateUsers, getUserName } from './globals'

let retryAuthPromise = null

async function retryAuth() {
  const name = getUserName()
  // eslint-disable-next-line no-use-before-define
  const { id, secret } = await apiCall('POST', '/users',
    { name }, { noRetryAuth: true, noUser: true })
  console.log('Regenerated new token from API', { [id]: secret })
  return { id, secret }
}

function queueRetryAuth() {
  return new Promise((resolve, reject) => {
    console.log('Authentication failed, trying to regenerate user')
    window.setTimeout(async () => {
      let newUser = { }
      const token = subscribeUsers((users) => {
        if (newUser.id && users.hasOwnProperty(newUser.id)) {
          unsubscribeUsers(token)
          resolve()
        }
      })

      try {
        newUser = await retryAuth()
      } catch (error) {
        reject(error)
      }

      updateUsers({ [newUser.id]: newUser.secret })
    }, 500)
  })
}

// API call wrapper, use this to communicate with the API server.
// By default this function returns a JSON output and throws for HTTP responses 400-599.
//
// method: HTTP method such as GET, POST, DELETE etc.
// endpoint: API endpoint without the /api/ prefix, eg. /version
// body: JSON body data
// opts: Extra options for the function
//   - rawResponse: Return the raw response from `fetch()` with no JSON conversion or
//                  automatic error handling
//   - noUser: Don't wait for the user to load
//   - noRetryAuth: Do not attempt to retry authentication
//   - noToast: Do not display error toast
//
// Example usage:
//   const { id } = await apiCall('POST', '/comments', { text: 'My comment!' })
export default async function apiCall(method, endpoint, body = null, opts = { }) {
  const url = apiUrl + endpoint
  if (!opts.noUser) {
    await waitForUsers()
  }

  const args = {
    headers: { },
    credentials: 'include',
    method,
  }

  if (body) {
    args.headers['Content-Type'] = 'application/json'
    args.body = JSON.stringify(body)
  }

  const response = await fetch(url, args)

  // Attempt automatic user regeneration
  if (response.status === 401 && response.headers.get('X-Feedback-Retry-Auth') && !opts.noRetryAuth) {
    if (!retryAuthPromise) {
      retryAuthPromise = queueRetryAuth()
    }
    try {
      await retryAuthPromise

      const result = await apiCall(method, endpoint, body, {
        ...opts, noRetryAuth: true,
      })

      return result
    } catch (error) {
      console.error('Failed to regenerate user')
    }
  }

  // -- Early return if raw response
  if (opts.rawResponse) return response

  const json = await response.json()

  if (response.status >= 400 && response.status <= 599) {
    const message = `API error ${response.status}: ${method} ${endpoint}  ${json.message}`
    console.error(message)
    if (!opts.noToast) toast.error(json.message)
    if (json.stack) console.error(json.stack)
    throw new Error(message)
  } else {
    return json
  }
}
