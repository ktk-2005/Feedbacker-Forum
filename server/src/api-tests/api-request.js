import request from 'request-promise-native'

export default function apiRequest(path, extraOpts) {
  const opts = {
    uri: 'http://localhost:8080' + path,
    json: true,
    ...extraOpts
  }
  return request(opts)
}

