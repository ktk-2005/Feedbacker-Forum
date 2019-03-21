// Helpers
import { shadowRoot, shadowDocument } from './shadowDomHelper'

// X path generation

// Never use this outside, event.target cannot be trusted so you need to pass el directly

// Ensure that svg or it's elements cannot be tagged
const getSVGParent = (element) => {
  if (element instanceof SVGElement) {
    return getSVGParent(element.parentNode)
  } else return element
}

const getXPath = (element) => {
  // Generates the path recursively
  const createXPath = (element) => {
    if (element.tagName === 'HTML') return '/HTML[1]'
    if (element === document.body) return '/HTML[1]/BODY[1]'

    let ix = 0
    const siblings = element.parentNode.childNodes
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i]
      if (sibling === element) return `${createXPath(element.parentNode)}/${element.tagName}[${ix + 1}]`
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++
    }
  }
  // Check if element is SVG or sub-element
  element = getSVGParent(element)
  return createXPath(element)
}

const getElementByXPath = path => {
  return document.evaluate(
    path,
    document.documentElement,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
}

// Events

// Polyfill
const eventPathFallback = (event) => {
  let el = event.target
  if (el == null) return []
  const pathArr = [el]
  while (el.parentElement != null) {
    el = el.parentElement
    // Prepend element
    pathArr.unshift(el)
  }

  return pathArr.reverse()
}

// TODO: For first iteration only, getEventTrace is used in bilateral implementation
const getXPathByElement = (event) => {
  let { path } = event
  if (!path) path = eventPathFallback(event)
  return getXPath(path[0])
}

// Clicks

// State
let markingMode = false
let currentCommentId
// Helper

const isMarkable = el => (
  !['html', 'body'].includes(el.tagName)
    && el !== shadowRoot()
    && !shadowDocument().contains(el)
)

const callbacks = {}
// eslint-disable-next-line
const setElementTaggedCallback = callback => callbacks.elementTagged = callback
// eslint-disable-next-line
const setToggleTagElementStateCallback = callback => callbacks.toggleActiveState = callback

const toggleHighlightElement = (el, forceAdd = false, commentId = '') => {
  const className = 'dom-tagging-element-highlighted'
  // SVG should never be tagged
  el = getSVGParent(el)
  // Check that two tags cannot be present at same time
  document.querySelectorAll(`.${ className }`).forEach( taggedEl => {
    if (taggedEl !== el) taggedEl.classList.remove(className)
  })

  // Force for highlight element on click for comment targets
  if (forceAdd) {
    if(!el.classList.contains(className)){
      el.classList.add(className)
    }
  } else {
    if (el.classList.contains(className) && currentCommentId === commentId) {
      el.classList.remove(className)
    } else {
      el.classList.add(className)
      currentCommentId = commentId
    }
  }
}

const clearAll = () => {
  const className = 'dom-tagging-element-highlighted'
  document.querySelectorAll(`.${ className }`).forEach( taggedEl => {
    taggedEl.classList.remove(className)
  })
}

// Hover

const handleHover = (event) => {
  const el = event.target
  if (isMarkable(el)) {
    toggleHighlightElement(el)
  }
}

const handleClick = (event) => {
  // console.log('DOMT debug', 'click fired', event)
  if (markingMode) {
    if (isMarkable(event.target)) {
      callbacks.elementTagged(event)
      // saveTag(event.target)
      // eslint-disable-next-line
      toggleMarkingMode()
    }
  }
  event.preventDefault()
}

const toggleMarkingModeListeners = () => {
  if (markingMode) {
    document.body.addEventListener('mouseover', handleHover)
    document.body.addEventListener('mouseout', handleHover)
    document.body.addEventListener('click', handleClick)
  } else {
    document.body.removeEventListener('mouseover', handleHover)
    document.body.removeEventListener('mouseout', handleHover)
    document.body.removeEventListener('click', handleClick)
  }
}

const toggleMarkingMode = () => {
  markingMode = !markingMode
  callbacks.toggleActiveState()
  toggleMarkingModeListeners()
}

const includeDomTaggingCss = () => {
  const accentColor = '#00c0cb'
  document.head.innerHTML += `
  <style>
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(0, 191, 201, 0.8);
      }
      70% {
        box-shadow: 0 0 7px 10px rgba(0, 191, 201, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(0, 191, 201, 0);
      }
    }

    .dom-tagging-element-highlighted {
      box-shadow: 0 0 0 0 rgba(0, 191, 201, 0.5);
      animation: pulse 1.75s infinite;
    }
  </style>
  `
}

includeDomTaggingCss()

export {
  setElementTaggedCallback,
  setToggleTagElementStateCallback,
  // hijackEventListeners,
  // startObservingDomChange,
  toggleMarkingMode,
  getXPathByElement,
  getElementByXPath,
  toggleHighlightElement,
  clearAll,
}

// TODO: Not in use below

/* eslint-disable max-len */
/*
// Observer

const startObservingDomChange = () => {
  // Create new observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      const entry = {
        mutation: m,
        el: m.target,
        value: m.target,
        oldValue: m.oldValue,
        addedNodes: m.addedNodes,
        removedNodes: m.removedNodes,
      }

      console.log('🤖', 'Recording mutation', entry, JSON.stringify(eventLog))
      logDomModifyingEvents()

      observer.disconnect()
      startObservingDomChange()
    })
  })

  const targetNode = document.querySelector('body')
  const config = {
    attributes: false,
    childList: true,
    subtree: true,
  }
  observer.observe(targetNode, config)
}

// Init

const init = () => {
  // loadTags()
  // startObservingDomChange()
  // hijackEventListeners() TODO: does not work
}
init()


// Event logging

const eventLog = {}
const trackedEvents = ['click']

const lastEventToHistory = (eventName, log) => {
  log.eventHistory = log.eventHistory || []
  log.eventHistory.push({
    eventName,
    index: log[eventName].length - 1,
  })
}

// Initialise log with wanted event listener hooks

const initialiseEventLog = (eventName) => {
  if (trackedEvents.includes(eventName)) {
    eventLog[eventName] = eventLog[eventName] || []
    lastEventToHistory(eventName, eventLog)
  }
}

// Log an event in right event type array

const logEvent = (eventName, event) => {
  if (trackedEvents.includes(eventName)) {
    eventLog[eventName].push(event)
    lastEventToHistory(eventName, eventLog)
    console.info('Tracked event logged', eventName, eventLog)
  }
}

// Log all dom modifying events in chronological order to each
// other (can be in different event type arrays)

const logDomModifyingEvents = () => {
  eventLog.domModifyingEvents = eventLog.domModifyingEvents || []
  eventLog.domModifyingEvents.push({
    // TODO: below undefined (can't read length of undefined)
    historyIndex: eventLog.eventHistory.length,
    // index + 1, next item is the right event reference
  })
}

// Hijack all addEventListeners in window

// Override for adding event listeners
/*
const oldAddEventListener = EventTarget.prototype.addEventListener

const hijackEventListeners = () => {
  console.log('DOMT debug', 'hijack called')

  EventTarget.prototype.addEventListener = (eventName, eventHandler) => {
    console.log('DOMT debug', 'hijack add event listener', 'this:', this, 'eventName:', eventName, 'eventHandler:', eventHandler)
    initialiseEventLog(eventName)

    oldAddEventListener.call(
      this, eventName, (event) => {
        logEvent(eventName, event)
        eventHandler(event)
      }, false // default
    )
  }
}

const getEventTrace = () => {
  const l = eventLog
  if (!l.domModifyingEvents) return null
  const events = l.domModifyingEvents.map(
    (dme) => {
      const historyObject = l.eventHistory[dme.historyIndex]
      // Get what key to find correct event type array
      const eventLogKey = historyObject.eventName
      // Get index in that array for correct event object
      const eventLogArrayIndex = historyObject.index
      const event = l[eventLogKey][eventLogArrayIndex]
      let { path } = event
      if (!path) path = eventPathFallback(event)
      console.log('getTrace', 'event.path:', event.path, 'eventPathFallback', eventPathFallback(event))
      return getXPath(path[0])
    }
  )
  return events
}

// Tagging

const localStorageKey = 'swp1-tagging-concept'

const getCommentsArray = () => JSON.parse(localStorage.getItem(localStorageKey)) || []

const attributeName = 'data-comment-count'

// Loading comments

const simulateEvents = (trace) => {
  if (trace) {
    console.log('📲', 'Simulate events from trace', trace)
    trace.forEach(
      (step) => {
        getElementByXPath(step).click()
      }
    )
  }
}

const loadTags = () => {
  /*
    const items = getCommentsArray()
    console.log('💾', 'getCommentsArray in loadTags =>  items', items)
    items.forEach((item) => {
      let el = getElementByXPath(item.path)
      if (!el) {
        // Element is not in DOM
        // Simulate events
        simulateEvents(item.trace)
        el = getElementByXPath(item.path)
      }
      if (el) {
        let value = el.getAttribute(attributeName) || 0
        el.setAttribute(attributeName, ++value)
        let title = el.getAttribute('title') || ''
        title = title.length ? `${title}, ` : title
        el.setAttribute('title', title + item.comment)
      }
    })
}

const refreshTags = () => {

    ['title', attributeName].forEach((a) => {
      document.querySelectorAll(`[${a}]`).forEach(el => el.removeAttribute(a))
    })
    loadTags()

}

// Save comment:

const saveTag = (el) => {

    const path = getXPath(el)
    const comment = prompt('Add comment')
    const trace = getEventTrace()
    console.log('🛤️', 'Tagged element path', path, 'trace for events', trace)
    const items = getCommentsArray()
    // Add to array
    items.push({
      path,
      trace,
      comment,
    })
    // Store
    localStorage.setItem(
      localStorageKey,
      JSON.stringify(items)
    )
    // Refresh view
    refreshTags()

}
*/
