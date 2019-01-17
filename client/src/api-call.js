import { apiUrl } from './meta/env.meta'
import { getUsers } from './globals'

export default function (method, endpoint, body) {
  const url = apiUrl + endpoint
  const users = getUsers()
  const authToken = btoa(JSON.stringify(users))

  const args = {
    headers: {
      'X-Feedback-Host': window.location.hostname,
      'Authorization': `Feedbacker ${authToken}`,
    },
    method,
  }

  if (body) {
    args.headers['Content-Type'] = 'application/json'
    args.body = JSON.stringify(body)
  }

  return fetch(url, args).then(body => body.json())
}

