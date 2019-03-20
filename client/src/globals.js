import * as R from 'ramda'
import { toast } from 'react-toastify'
import { setPersistData } from './actions'

let users = { }
let userCallbackCounter = 0
let userName = null
const userChangeCallbacks = new Map()

let userUpdateCallback = null

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

export function subscribeUpdateUsers(func) {
  userUpdateCallback = func
}

export function setUserName(name) {
  userName = name
}

export function getUserName() {
  return userName
}

export function updateUsers(users) {
  userUpdateCallback(users)
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
  return new Promise((resolve) => {
    if (!R.isEmpty(users)) resolve(users)
    else {
      const token = subscribeUsers((users) => {
        unsubscribeUsers(token)
        resolve(users)
      })
    }
  })
}

export function showCookieToast(dispatch) {
  const message = 'By continuing to use Feedbacker Forum you accept our use of cookies.'
  toast(message, {
    autoClose: false,
    onClose: () => {
      dispatch(setPersistData({ acceptCookies: true }))
    },
  })
}

// Gets called onKeyDown from textArea of form element, if keys pressed are ctrl+enter or
//  metaKey+enter, clicks parentelements input element which has attribute type="submit"
export function keyPressSubmit(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const parent = e.target.parentNode
    const submit = parent.querySelector('input[type="submit"]')
    if (submit) submit.click()
  }
}

export async function shareSlack(that, path, apiCall) {
  that.setState({ disableSlack: true })
  let succ = null
  try {
    const { success } = await apiCall('GET', `/slack/notify/${path}`)
    succ = success
  } catch (error) {
    // Do nothing
  }
  that.setState({ disableSlack: false })
  if (succ) {
    const message = 'Slack notification sent.'
    toast(message, {
      autoClose: 2000,
    })
  }
}

export function isMobileViewport() {
  return window.innerWidth < 500 // Same as in variables.scss
}
