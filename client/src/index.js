import React from 'react'
import ReactDOM from 'react-dom'
// Redux
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
// External libraries & helpers
import * as R from 'ramda'
import retargetEvents from 'react-shadow-dom-retarget-events'
import classNames from 'classnames/bind'
import * as DomTagging from './dom-tagging'
import apiCall from './api-call.js'
import { setUsers } from './globals.js'
// Components
import OpenSurveyPanelButton from './components/open-survey-panel-button/open-survey-panel-button'
import SurveyPanel from './components/survey-panel/survey-panel'
import CommentPanel from './components/comment-panel/comment-panel'
import TagElementButton from './components/tag-element-button/tag-element-button'
// Internal js
import { setupPersist } from './persist'
import { apiUrl } from './meta/env.meta'
// Styles
import styles from './scss/_base.scss'

const css = classNames.bind(styles)

const LOAD_PERSIST = 'LOAD_PERSIST'
const SET_PERSIST = 'SET_PERSIST'
const LOAD_ALL = 'LOAD_ALL'

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

function commentsReducer(state = {}, action) {
  switch (action.type) {
    case LOAD_ALL:
      return action.comments
    /*
    case RELOAD_COMMENT:
      return action

    case PREVIEW_COMMENT:
      return action
    */
    default:
      return state
  }
}

const reducer = combineReducers({
  persist: persistReducer,
  comments: commentsReducer,
})

const store = createStore(reducer)

class MainView extends React.Component {
  constructor(props) {
    super(props)

    this.handleSurveyPanelClick = this.handleSurveyPanelClick.bind(this)
    this.toggleTagElementState = this.toggleTagElementState.bind(this)
    this.handleElementTagged = this.handleElementTagged.bind(this)

    this.state = {
      surveyPanelIsHidden: true,
      surveyButtonIsHidden: false,
      taggingModeActive: false,
      taggedElementXPath: '',
    }
  }

  handleSurveyPanelClick() {
    this.setState(state => ({
      surveyPanelIsHidden: !state.surveyPanelIsHidden,
      surveyButtonIsHidden: !state.surveyButtonIsHidden,
    }))
  }

  toggleTagElementState() {
    this.setState(state => ({
      taggingModeActive: !state.taggingModeActive,
    }))
  }

  handleElementTagged(event) {
    const xPath = DomTagging.getXPathByElement(event)
    this.setState({
      taggedElementXPath: xPath,
    })
  }

  render() {
    const {
      surveyButtonIsHidden,
      surveyPanelIsHidden,
      taggingModeActive,
    } = this.state

    return (
      <div
        className={taggingModeActive ? css('feedback-app-container', 'tagging-mode-active') : css('feedback-app-container')}
      >
        <TagElementButton
          active={taggingModeActive}
          elementTagged={this.handleElementTagged}
          toggleTagElementState={this.toggleTagElementState}
        />
        <OpenSurveyPanelButton
          hidden={surveyButtonIsHidden}
          onClick={this.handleSurveyPanelClick}
        />
        <SurveyPanel
          hidden={surveyPanelIsHidden}
          onClick={this.handleSurveyPanelClick}
        />
        <CommentPanel taggedElementXPath={this.state.taggedElementXPath} />
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

  const blockLegacyBrowsers = () => {
    const isLegacy = window.navigator.userAgent.match(/(MSIE|Trident|Edge)/)
    // eslint-disable-next-line
    while (isLegacy) alert('This browser is not currently supported. Please use chrome or firefox.')
  }

  blockLegacyBrowsers()

  const loadPersist = async (state, allDataLoaded) => {
    store.dispatch({ type: LOAD_PERSIST, state })

    if (allDataLoaded) {
      if (!state.users || R.isEmpty(state.users)) {
        const { id, secret } = await apiCall('POST', '/users')

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

  apiCall('GET', '/comments')
    .then((comments) => {
      store.dispatch({ type: LOAD_ALL, comments })
    })

  store.subscribe(() => {
    const persist = store.getState().persist || { }
    savePersist(persist)
    setUsers(persist.users || { })
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
}

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
