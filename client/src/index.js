import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import classNames from 'classnames/bind'
import * as R from 'ramda'
import Button from './components/open-panel-button/open-panel-button'
import FloatingPanel from './components/floating-panel-view/floating-panel-view'
import { setupPersist } from './persist'
import { apiUrl } from './meta/env.meta'

import styles from './scss/_base.scss'

const css = classNames.bind(styles)

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

const feedbackAppRoot = () => {
  const feedbackAppRoot = document.createElement('div')
  feedbackAppRoot.setAttribute('data-feedback-app-root', true)
  document.body.appendChild(feedbackAppRoot)
  return feedbackAppRoot
}

class MainView extends React.Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      panelIsHidden: true,
      buttonIsHidden: false,
    }
  }

  handleClick() {
    this.setState(state => ({
      buttonIsHidden: !state.buttonIsHidden,
      panelIsHidden: !state.panelIsHidden,
    }))
  }

  render() {
    const { buttonIsHidden, panelIsHidden } = this.state

    return (
      <div>
        <Button
          hidden={buttonIsHidden}
          onClick={this.handleClick}
        />
        <FloatingPanel
          hidden={panelIsHidden}
          onClick={this.handleClick}
        />
      </div>
    )
  }
}

const initializedKey = '!!feedbacker_forum_initialized!!'

const initialize = () => {
  if (window[initializedKey] || !document.body) {
    return
  }

  window[initializedKey] = true

  const loadPersist = async (state, allDataLoaded) => {
    store.dispatch({ type: LOAD_PERSIST, state })

    if (allDataLoaded) {
      if (!state.users || R.isEmpty(state.users)) {
        const response = await fetch(`${apiUrl}/users`, {
          method: 'POST',
        })
        const { id, secret } = await response.json()

        console.log('Created new user from API', { [id]: secret })

        store.dispatch({
          type: SET_PERSIST,
          data: {
            users: {
              [id]: secret,
            },
          },
        })
      } else {
        console.log('Loaded user from persistent storage', state.users)
      }
    }
  }

  const savePersist = setupPersist(loadPersist)

  store.subscribe(() => {
    savePersist(store.getState().persist || { })
  })

  ReactDOM.render(
    <div className={css('feedback-app-main-container')}>
      <MainView />
    </div>,
    feedbackAppRoot()
  )
}

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
