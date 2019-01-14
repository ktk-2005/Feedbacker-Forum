import React from 'react'
import ReactDOM from 'react-dom'
// Redux
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
// External libraries
import * as R from 'ramda'
import retargetEvents from 'react-shadow-dom-retarget-events'
import classNames from 'classnames/bind'
// Components
import OpenSurveyPanelButton from './components/open-survey-panel-button/open-survey-panel-button'
import SurveyPanel from './components/survey-panel/survey-panel'
import CommentPanel from './components/comment-panel/comment-panel'
import { TagElementButton, initializeDomTagging } from './components/tag-element-button/tag-element-button'
// Internal js
import { setupPersist } from './persist'
import { apiUrl } from './meta/env.meta'
// Styles
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

class MainView extends React.Component {
  constructor(props) {
    super(props)

    this.handleSurveyPanelClick = this.handleSurveyPanelClick.bind(this)
    this.handleTagElementClick = this.handleTagElementClick.bind(this)

    this.state = {
      surveyPanelIsHidden: true,
      surveyButtonIsHidden: false,
      taggingModeActive: false,
    }
  }

  handleSurveyPanelClick() {
    this.setState(state => ({
      surveyPanelIsHidden: !state.surveyPanelIsHidden,
      surveyButtonIsHidden: !state.surveyButtonIsHidden,
    }))
  }

  handleTagElementClick() {
    this.setState(state => ({
      taggingModeActive: !state.taggingModeActive,
    }))
  }

  render() {
    const {
      surveyButtonIsHidden,
      surveyPanelIsHidden,
      taggingModeActive,
    } = this.state

    return (
      <div className={css('feedback-app-container')}>
        <TagElementButton
          active={taggingModeActive}
          onClick={this.handleTagElementClick}
        />
        <OpenSurveyPanelButton
          hidden={surveyButtonIsHidden}
          onClick={this.handleSurveyPanelClick}
        />
        <SurveyPanel
          hidden={surveyPanelIsHidden}
          onClick={this.handleSurveyPanelClick}
        />
        <CommentPanel />
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

  const prepareReactRoot = () => {
    const shadow = document.querySelector('[data-feedback-shadow-root]').shadowRoot
    // Events fail otherwise in shadow root
    retargetEvents(shadow)
    const reactRoot = document.createElement('div')
    reactRoot.setAttribute('data-feedback-react-root', true)
    shadow.appendChild(reactRoot)
    return reactRoot
  }

  ReactDOM.render(
    <Provider store={store}>
      <MainView />
    </Provider>,
    prepareReactRoot()
  )

  // initializeDomTagging()
}

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
