import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import { connect, Provider } from 'react-redux'
import classNames from 'classnames/bind'
import Button from './components/open-panel-button/open-panel-button'
import FloatingPanel from './components/floating-panel-view/floating-panel-view'
import { setupPersist } from './persist'
import * as R from 'ramda'
import {apiUrl} from './meta/env.meta'

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

const loadPersist = async (state, allDataLoaded) => {
  store.dispatch({ type: LOAD_PERSIST, state })

  if (allDataLoaded) {
    if (!state.users || R.isEmpty(state.users)) {

      // TODO: Get these from the API!
      const { key, secret } = await fetch(`${apiUrl}/users`, {
        method: "POST"
      })

      store.dispatch({
        type: SET_PERSIST,
        data: {
          users: {
            [key]: secret,
          },
        }
      })
    }
  }
}

const savePersist = setupPersist(loadPersist)

store.subscribe(() => {
  console.log(store.getState())
  savePersist(store.getState().persist || { })
})

const feedbackAppRoot = () => {
  const feedbackAppRoot = document.createElement('div')
  document.addEventListener('DOMContentLoaded', () => {
    feedbackAppRoot.setAttribute('data-feedback-app-root', true)
    console.info('document', document)
    document.querySelector("body").appendChild(feedbackAppRoot)
  }, false)
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

ReactDOM.render(
  <div className={css('feedback-app-main-container')}>
    <MainView />
  </div>,
  feedbackAppRoot()
)
