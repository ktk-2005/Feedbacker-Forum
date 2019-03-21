import React from 'react'
import ReactDOM from 'react-dom'
// Redux
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
// Helpers
import { ToastContainer } from 'react-toastify'
import * as R from 'ramda'
import classNames from 'classnames/bind'

import { setupPersist } from './persist'
import AuthenticationView from './dev-components/authorization-view/authorization-view'
import { prepareReactRoot } from './shadowDomHelper'
import { setUsers, subscribeUpdateUsers, setUserName, showCookieToast } from './globals'
import apiCall from './api-call'
import { setPersistData } from './actions'
// Styles
import styles from './scss/_base.scss'
import './scss/atoms/_toast.scss'

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
        <div className={css('feedback-app-container', 'site-views')}>
          <AuthenticationView />
        </div>
      </Provider>
    </div>,
    prepareReactRoot()
  )
}

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
