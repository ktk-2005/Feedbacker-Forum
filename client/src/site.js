import React from 'react'
import ReactDOM from 'react-dom'
// Redux
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
// Helpers
import { ToastContainer } from 'react-toastify'
import * as R from 'ramda'
import classNames from 'classnames/bind'
import {
  BrowserRouter as Router, Route, Switch
} from 'react-router-dom'

import { setupPersist } from './persist'
import Dashboard from './dev-components/dashboard-view/dashboard-view'
import Create from './dev-components/create/create'
import Build from './dev-components/build-view/build-view'
import View404 from './dev-components/404-view/404-view'
import { prepareReactRoot } from './shadowDomHelper'
import { setUsers, subscribeUpdateUsers, setUserName, showCookieToast } from './globals'
import apiCall from './api-call'
import { setPersistData } from './actions'
// Styles
import styles from './scss/_base.scss'
import './scss/atoms/_toast.scss'
import CreateRunner from './dev-components/create-runner/create-runner'

const css = classNames.bind(styles)

const initializedKey = '!!feedbacker_forum_site_initialized!!'

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

      if (!state.acceptCookies) {
        showCookieToast(store.dispatch.bind(store))
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
    <div className={css('management-container')}>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnVisibilityChange
        draggable={false}
        pauseOnHover
        className={css('toast-container')}
        toastClassName={css('toast')}
        progressClassName={css('toast-progress')}
      />
      <Provider store={store}>
        <Router>
          <div className={css('feedback-app-container', 'site-views')}>
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route exact path="/create/:segment?" component={Create} />
              <Route exact path="/create-runner" component={CreateRunner} />
              <Route exact path="/logs/:name" component={Build} />
              <Route exact path="*" component={View404} />
            </Switch>
          </div>
        </Router>
      </Provider>
    </div>,
    prepareReactRoot()
  )
}

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
