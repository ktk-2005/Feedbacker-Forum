import { apiUrl } from './meta/env.meta'
import { waitForUsers } from './globals'

// API call wrapper, use this to communicate with the API server. This wrapper
// adds `Authentication` and `X-Feedback-Host` headers to provide context for the server.
// By default this function returns a JSON output and throws for HTTP responses 400-599.
//
// method: HTTP method such as GET, POST, DELETE etc.
// endpoint: API endpoint without the /api/ prefix, eg. /version
// body: JSON body data
// opts: Extra options for the function
//   - rawResponse: Return the raw response from `fetch()` with no JSON conversion or
//                  automatic error handling
//   - noUser: If set don't attach user header
//
// Example usage:
//   const { id } = await apiCall('POST', '/comments', { text: 'My comment!' })
export default async function (method, endpoint, body = null, opts = { }) {
  const url = apiUrl + endpoint
  const users = opts.noUser ? {} : await waitForUsers()
  const authToken = btoa(JSON.stringify(users))

  const args = {
    headers: {
      'X-Feedback-Host': window.location.hostname,
      Authorization: `Feedbacker ${authToken}`,
    },
    method,
  }

  if (body) {
    args.headers['Content-Type'] = 'application/json'
    args.body = JSON.stringify(body)
  }

  const response = await fetch(url, args)

  // -- Early return if raw response
  if (opts.rawResponse) return response

  const json = await response.json()

  if (response.status >= 400 && response.status <= 599) {
    const message = `API error ${response.status}: ${method} ${endpoint}  ${json.message}`
    console.error(message)
    if (json.stack) console.error(json.stack)
    throw new Error(message)
  } else {
    return json
  }
}

