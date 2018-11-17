import { staticUrl, storageName } from './meta/env.meta'

const storageKey = `FeedbackerForum_${storageName}`

let previousState = null
let previousJson = ''

let persistWindow = null

function loadLocalState() {
  const result = { }

  const storageVal = window.localStorage.getItem(storageKey)
  if (typeof storageVal === 'string') {
    try {
      Object.assign(result, JSON.parse(storageVal))
    } catch (e) {
      console.error('Failed to recover local storage persist', e)
    }
  }

  const cookieRegex = new RegExp(`${storageKey}\\s*=(\\s*[A-Za-z0-9-_.!~*'()]+)`)
  const match = document.cookie.match(cookieRegex)
  const cookieVal = Array.isArray(match) ? match[1] : null
  if (typeof cookieVal === 'string') {
    try {
      Object.assign(result, JSON.parse(decodeURIComponent(cookieVal)))
    } catch (e) {
      console.error('Failed to recover cookie persist', e)
    }
  }

  return result
}

function saveLocalState(json) {
  window.localStorage.setItem(storageKey, json)

  const safe = encodeURIComponent(json)
  document.cookie = `${storageKey}=${safe};path=/;max-age=315360000`
}

function saveGlobalState(json) {
  if (!persistWindow) return
  persistWindow.postMessage({
    type: 'save', data: json,
  }, '*')
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
  loadPersist(state)

  const iframe = document.createElement('iframe')

  iframe.style.width = 0
  iframe.style.height = 0
  iframe.style.border = 'none'
  iframe.style.position = 'absolute'
  iframe.style.visibility = 'hidden'
  iframe.style.top = '0px'
  iframe.style.left = '0px'

  iframe.src = `//${staticUrl}/persist.html`
  document.body.appendChild(iframe)

  persistWindow = iframe.contentWindow || iframe.contentDocument.window

  window.addEventListener('message', (e) => {
    if (e.source !== persistWindow) return
    const msg = e.data
    if (typeof msg !== 'object') return
    if (msg.type !== 'load') return
    if (typeof msg.data !== 'object') return

    const state = { ...msg.data, ...previousState }
    loadPersist(state)

    const json = JSON.stringify(state)
    saveLocalState(json)
    saveGlobalState(json)
  })

  return savePersist
}

