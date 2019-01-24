import React from 'react'
import ReactDOM from 'react-dom'
// Redux
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
// External libraries & helpers
import * as R from 'ramda'
import classNames from 'classnames/bind'
import * as DomTagging from './dom-tagging'
import apiCall from './api-call'
import { setUsers } from './globals'
import { prepareReactRoot } from './shadowDomHelper'
// Components
import OpenSurveyPanelButton from './components/open-survey-panel-button/open-survey-panel-button'
import SurveyPanel from './components/survey-panel/survey-panel'
import SurveyCreatePanel from './components/survey-creator/survey-create-panel'
import CommentPanel from './components/comment-panel/comment-panel'
import TagElementButton from './components/tag-element-button/tag-element-button'
// Internal js
import { setupPersist } from './persist'
import { loadPersistData, setPersistData, loadComments } from './actions'
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
    this.unsetTaggedElement = this.unsetTaggedElement.bind(this)

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

  unsetTaggedElement() {
    this.setState({
      taggedElementXPath: '',
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
        className={css('feedback-app-container', { 'tagging-mode-active': taggingModeActive })}
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
        <CommentPanel
          taggedElementXPath={this.state.taggedElementXPath}
          unsetTaggedElement={this.unsetTaggedElement}
        />
        <SurveyCreatePanel
          hidden={false}
          onClick={this.handleSurveyPanelClick}
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

  const blockLegacyBrowsers = () => {
    const isLegacy = window.navigator.userAgent.match(/(MSIE|Trident|Edge)/)
    // eslint-disable-next-line
    while (isLegacy) alert('This browser is not currently supported. Please use chrome or firefox.')
  }

  blockLegacyBrowsers()

  const loadPersist = async (state, allDataLoaded) => {
    store.dispatch(loadPersistData(state))

    if (allDataLoaded) {
      if (!state.users || R.isEmpty(state.users)) {
        const { id, secret } = await apiCall('POST', '/users')

        console.log('Created new user from API', { [id]: secret })

        store.dispatch(setPersistData({ users: { [id]: secret } }))
      } else {
        console.log('Loaded user from persistent storage', state.users)
      }
    }
  }

  const savePersist = setupPersist(loadPersist)

  apiCall('GET', '/comments')
    .then((comments) => {
      store.dispatch(loadComments(comments))
    })

  store.subscribe(() => {
    const persist = store.getState().persist || { }
    savePersist(persist)
    setUsers(persist.users || { })
  })


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
