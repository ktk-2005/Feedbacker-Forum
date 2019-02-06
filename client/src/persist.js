/*
 * This module implements cross-domain persistent storage: The application can save
 * data on eg. `user-domain.org` and load it back on `another-domain.org`. This is
 * done by transferring the data through an <iframe> which is under our own domain.
 * The state is also duplicated under the current domain. The states are merged
 * preferring the values inside the local domain.
 *
 * API: setupPersist(loadPersist) -> savePersist
 *   loadPersist(state): This function is called when the persistent data is loaded.
 *                       Once immediately at startup and potentially a second time
 *                       after the <iframe> finishes loading.
 *   savePersist(state): Update the persistent state to be `state`.
 */

import * as R from 'ramda'
import { staticUrl } from './meta/env.meta'
import { storageKey, storageCookieRegex } from './persist.meta'

const cookieRegex = new RegExp(storageCookieRegex)

// The state that is currently persistently saved
let previousState = null
let previousJson = ''

// Window handle of the <iframe>
let persistWindow = null

// Load the state from the current domain
function loadLocalState() {
  const result = { }

  const storageVal = window.localStorage.getItem(storageKey)
  if (typeof storageVal === 'string') {
    try {
      Object.assign(result, JSON.parse(storageVal))
    } catch (error) {
      console.error('Failed to recover local storage persist', error)
    }
  }

  const match = document.cookie.match(cookieRegex)
  const cookieVal = Array.isArray(match) ? match[1] : null
  if (typeof cookieVal === 'string') {
    try {
      Object.assign(result, JSON.parse(decodeURIComponent(cookieVal)))
    } catch (error) {
      console.error('Failed to recover cookie persist', error)
    }
  }

  return result
}

// Save the state into the current domain
function saveLocalState(json) {
  window.localStorage.setItem(storageKey, json)

  const safe = encodeURIComponent(json)
  document.cookie = `${storageKey}=${safe};path=/;max-age=315360000`
}

function saveGlobalState(json) {
  if (!persistWindow) return
  try {
    persistWindow.postMessage({
      type: 'save', data: json,
    }, '*')
  } catch (error) {
    console.error('Unexpected <iframe> communication error', error)
  }
}

function savePersist(state) {
  if (state === previousState) return
  previousState = state

  const json = JSON.stringify(state)
  if (json === previousJson) return
  previousJson = json

  saveLocalState(json)
  saveGlobalState(json)
}

export function setupPersist(loadPersist) {
  const state = loadLocalState()
  loadPersist(state, false)

  previousState = state

  const iframe = document.createElement('iframe')

  iframe.style.width = 0
  iframe.style.height = 0
  iframe.style.border = 'none'
  iframe.style.position = 'absolute'
  iframe.style.visibility = 'hidden'
  iframe.style.top = '0'
  iframe.style.left = '0'

  iframe.src = `${staticUrl}/persist.html`
  document.body.appendChild(iframe)

  persistWindow = iframe.contentWindow || (iframe.contentDocument && iframe.contentDocument.window)

  let allDataLoaded = false

  const timeout = window.setTimeout(() => {
    if (allDataLoaded) return
    allDataLoaded = true

    loadPersist(state, true)
  }, 3000)

  iframe.addEventListener('error', () => {
    if (allDataLoaded) return
    allDataLoaded = true

    loadPersist(state, true)
    window.clearTimeout(timeout)
  })

  window.addEventListener('message', (event) => {
    if (event.source !== persistWindow) return
    const msg = event.data
    if (typeof msg !== 'object') return
    if (msg.type !== 'load') return
    if (typeof msg.data !== 'object') return

    const state = R.mergeDeepRight(previousState, msg.data)

    const json = JSON.stringify(state)
    saveLocalState(json)
    saveGlobalState(json)

    if (allDataLoaded) return
    allDataLoaded = true

    loadPersist(state, true)
    window.clearTimeout(timeout)
  })

  return savePersist
}
