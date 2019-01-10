import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import classNames from 'classnames/bind'
import * as R from 'ramda'
import { Provider } from 'react-redux'
import OpenSurveyPanelButton from './components/open-survey-panel-button/open-survey-panel-button'
import SurveyPanel from './components/survey-panel-view/survey-panel-view'
import CommentPanel from './components/comment-panel/comment-panel'
import { TagElementButton, initializeDomTagging } from './components/tag-element-button/tag-element-button'
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
      <div>
        <OpenSurveyPanelButton
          hidden={surveyButtonIsHidden}
          onClick={this.handleSurveyPanelClick}
        />
        <SurveyPanel
          hidden={surveyPanelIsHidden}
          onClick={this.handleSurveyPanelClick}
        />
        <TagElementButton
          active={taggingModeActive}
          onClick={this.handleTagElementClick}
        />
        <CommentPanel />
      </div>
    )
  }
}

let isInitialized = false

const initialize = () => {
  if (isInitialized || !document.body) {
    return
  }

  isInitialized = true

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
    <Provider store={store}>
      <div className={css('feedback-app-main-container')}>
        <MainView />
      </div>
    </Provider>,
    feedbackAppRoot()
  )

  // initializeDomTagging()
}

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
