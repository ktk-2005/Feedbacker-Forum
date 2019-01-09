// Event logging

export function domTagging() {
  const eventLog = {}
  const trackedEvents = ['click']

  const lastEventToHistory = (eventName, log) => {
    log.eventHistory = log.eventHistory || []
    log.eventHistory.push({
      eventName,
      index: log[eventName].length - 1,
    })
  }

  // Helper

  const isMarkable = el => !el.classList.contains('safezone') && !['html', 'body'].includes(el.tagName)

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
      historyIndex: eventLog.eventHistory.length,
      // index + 1, next item is the right event reference
    })
  }

  // Hijack all addEventListeners in window

  // Override for adding event listeners
  const oldAddEventListener = EventTarget.prototype.addEventListener

  EventTarget.prototype.addEventListener = (eventName, eventHandler) => {
    initialiseEventLog(eventName)

    oldAddEventListener.call(
      this, eventName, (event) => {
        logEvent(eventName, event)
        eventHandler(event)
      }
    )
  }

  // X path generation

  const getXPath = (element) => {
    if (element.id !== '') return `id("${element.id}")`
    if (element === document.body) return element.tagName

    let ix = 0
    const siblings = element.parentNode.childNodes
    siblings.forEach((sibling) => {
      if (sibling === element) return `${getXPath(element.parentNode)}/${element.tagName}[${ix + 1}]`
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++
    })
  }

  const getElementByXPath = path => document.evaluate(
    path,
    document.documentElement,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue

  // Events


  // Polyfill
  function eventPathFallback(event) {
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

  // Clicks

  // State
  let markingMode = false

  const toggleMarkingMode = () => {
    document
      .querySelector('.feedback-target-container')
      .classList.toggle('marking-mode')
    markingMode = !markingMode
  }

  document.body.addEventListener('click', (event) => {
    if (markingMode) {
      if (isMarkable(event.target)) {
        saveTag(event.target)
        toggleMarkingMode()
      }
    }
  })


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

  // Hover

  const markableToggle = (el) => {
    if (isMarkable(el)) {
      if (markingMode) el.classList.toggle('highlighted')
      else el.classList.remove('highlighted')
    }
  }

  document.body.addEventListener('mouseover', event => markableToggle(event.target))

  document.body.addEventListener('mouseout', event => markableToggle(event.target))

  // Init

  const init = () => {
    loadTags()
    startObservingDomChange()
  }

  init()
}
