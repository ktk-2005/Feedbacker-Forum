import * as R from 'ramda'

let users = { }
let userCallbackCounter = 0
const userChangeCallbacks = new Map()

// Subscribe `func(users)` to be called when users are loaded or created
// Returns an unsubscribe token
export function subscribeUsers(func) {
  userCallbackCounter++
  userChangeCallbacks.set(userCallbackCounter, func)

  if (!R.isEmpty(users)) func(users)

  return userCallbackCounter
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

export function waitForUsers() {
  return new Promise((resolve, reject) => {
    if (!R.isEmpty(users)) resolve(users)
    else {
      const token = subscribeUsers((users) => {
        unsubscribeUsers(token)
        resolve(users)
      })
    }
  })
}

