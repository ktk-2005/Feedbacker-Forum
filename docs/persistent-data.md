
# Persistent data

We have persistent data that needs to survive between user sessions. For example the
name of the user should be persisted. More importantly as we don't have login data
the feedback comment ownership is stored locally and thus is important to keep intact.

The feedback tool is injected into the users site and thus lives in the URL and
domain of the user. However we would like to share persistent data between multiple
domains. If the user writes their name in `example-domain.org` and later opens the
feedback tool in `another-domain.com` the name should already be populated.

## Implementation

The classic way to store persistent data is to use [cookies][mdn-cookie]. A newer
altenative is to use [localStorage][mdn-localStorage], which is basically an persistent
associative array. We use both techniques simulataneously as we want to store
data into the user's context. For example the user code could call `localStorage.clear()`
and accidentally delete our persistent storage as well.

For security reasons browsers make sharing data between domains extremely difficult.
Our solution is to create an [`<iframe>`][mdn-iframe] tag pointed at our own domain.
We can securely communicate with the `<iframe>` using the [`postMessage()`][mdn-postMessage]
web API.

A downside with this technique (or any domain-crossing persistent storage) is that
it looks a lot like an advertiser tracking script. This means that some privacy-focused
browsers and extensions might block the communication.

The persistent data is replicated into four locations: Cookie and local storage of both
the user domain and our own. The persistent data in the user's domain is stored under
a complicated key name eg. `FeedbackerForum_localhost8080`.

## API

The persistent storage API has only one function: `setupPersist()`. It takes
a `loadPersist(state)` callback and returns a `savePersist(state)` function.
Every time some part of the persistent storage is called `loadPersist()` is
called with the accumulated state. Other code can update the persistent storage
using `savePersist()`. This API integrates well with [Redux][redux].

```js
function persistReducer(state = { }, action) {
  switch (action.type) {
    // Replace the current persistent state with a new one
    case 'LOAD_PERSIST': return action.state
    // Merge the current persistent state with some new values
    case 'SET_PERSIST': return { ...state, ...action.data }
    default: return state
  }
}

// Setup Redux with our persistent reducer
const reducer = combineReducers({
  persist: persistReducer,
})
const store = createStore(reducer)

const savePersist = setupPersist((state) => {
  // Persist -> Redux: This is called when the persistent data is loaded.
  store.dispatch({ type: 'LOAD_PERSIST', state })
})

store.subscribe(() => {
  // Redux -> Persist: This is called when the Redux state is changed
  savePersist(store.getState().persist || { })
})

// Persistent value updates are done through Redux, the data is saved into
// persistent storage through the `store.subscribe()` handler.
function updateValue(value) {
  store.dispatch({
    type: 'SET_PERSIST',
    data: { value },
  })
}
```

[mdn-iframe]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
[mdn-postMessage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
[mdn-cookie]: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
[mdn-localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[redux]: https://redux.js.org
