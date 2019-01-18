import * as R from 'ramda'

let users = { }
let userCallbackCouter = 0
const userChangeCallbacks = new Map()

// Subscribe `func(users)` to be called when users are loaded or created
// Returns an unsubscribe token
export function subscribeUsers(func) {
  userCallbackCouter++
  userChangeCallbacks.set(userCallbackCouter, func)

  if (!R.isEmpty(users)) func(users)

  return userCallbackCouter
}

// Cancel a previous user subscription, called with the return value of `subscribeUsers()`
export function unsubscribeUsers(token) {
  userChangeCallbacks.delete(token)
}

export function setUsers(value) {
  if (!R.equals(users, value)) {
    users = value
    userChangeCallbacks.forEach(fn => fn(users))
  }
}

export function getUsers() {
  return users
}

