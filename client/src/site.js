import React from 'react'
import ReactDOM from 'react-dom'
// Redux
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
// Helpers
import * as R from 'ramda'
import classNames from 'classnames/bind'
import {
  BrowserRouter as Router, Route, Switch
} from 'react-router-dom'
import { setupPersist } from './persist'
import Dashboard from './dashboard-view'
import Create from './create'
import InvalidContainer from './invalid-container'
import Build from './build-view'
import { prepareReactRoot } from './shadowDomHelper'
import { setUsers, subscribeUpdateUsers, setUserName } from './globals'
import apiCall from './api-call'
import { setPersistData } from './actions'
// Styles
import styles from './scss/_base.scss'

const css = classNames.bind(styles)

const initializedKey = '!!feedbacker_forum_initialized!!'

const LOAD_PERSIST = 'LOAD_PERSIST'
const SET_PERSIST = 'SET_PERSIST'

function persistReducer(state = { }, action) {
  switch (action.type) {
    case LOAD_PERSIST:
      return action.state

    case SET_PERSIST:
      return R.mergeDeepRight(state, action.data)

    default:
      return state
  }
}

const reducer = combineReducers({
  persist: persistReducer,
})

const store = createStore(reducer)

const initialize = () => {
  if (window[initializedKey] || !document.body) {
    return
  }

  window[initializedKey] = true

  const loadPersist = async (state, allDataLoaded) => {
    store.dispatch({ type: LOAD_PERSIST, state })

    if (allDataLoaded) {
      if (!state.users || R.isEmpty(state.users)) {
        const { id, secret } = await apiCall('POST', '/users',
          { name: state.name }, { noUser: true, noRetryAuth: true })

        console.log('Created new user from API', { [id]: secret })

        store.dispatch(setPersistData({ users: { [id]: secret } }))
      } else {
        console.log('Loaded user from persistent storage', state.users)
      }
    }
  }

  const savePersist = setupPersist(loadPersist)

  store.subscribe(() => {
    const persist = store.getState().persist || { }
    savePersist(persist)
    setUsers(persist.users || { })
    setUserName(persist.name)
  })

  subscribeUpdateUsers((newUsers) => {
    store.dispatch(setPersistData({ users: newUsers }))
  })

  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <div className={css('feedback-app-container', 'site-views')}>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route exact path="/create" component={Create} />
            <Route exact path="/invalid-container/:name" component={InvalidContainer} />
            <Route exact path="/logs/:name" component={Build} />
          </Switch>
        </div>
      </Router>
    </Provider>,
    prepareReactRoot()
  )
}

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
