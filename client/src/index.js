import React from 'react'
import ReactDOM from 'react-dom'
import Modal from 'react-modal'
// Redux
import { createStore, combineReducers } from 'redux'
import { Provider, connect } from 'react-redux'
// External libraries & helpers
import * as R from 'ramda'
import { ToastContainer } from 'react-toastify'
import classNames from 'classnames/bind'
import * as DomTagging from './dom-tagging'
import apiCall from './api-call'
import { setUsers, subscribeUpdateUsers, setUserName, showCookieToast, isMobileViewport } from './globals'
import { prepareReactRoot } from './shadowDomHelper'

// Components
import OpenSurveyPanelButton from './feedbacker-components/open-survey-panel-button/open-survey-panel-button'
import SurveyPanel from './feedbacker-components/survey-panel/survey-panel'
import OpenCommentPanelButton from './feedbacker-components/open-comment-panel-button/open-comment-panel-button'
import CommentPanel from './feedbacker-components/comment-panel/comment-panel'
import Onboarding from './feedbacker-components/onboarding/onboarding'
import DashboardLink from './feedbacker-components/dashboard-link/dashboard-link'

// Internal js
import { setupPersist } from './persist'
import { getSession, updateSession } from './session'
import { loadPersistData, setPersistData, loadComments, updateRole } from './actions'
// Styles
import styles from './scss/_base.scss'
import './scss/atoms/_toast.scss'

const css = classNames.bind(styles)

const LOAD_PERSIST = 'LOAD_PERSIST'
const SET_PERSIST = 'SET_PERSIST'
const LOAD_ALL = 'LOAD_ALL'
const INTRO_COMPLETED = 'INTRO_COMPLETED'
const UPDATE_ROLE = 'UPDATE_ROLE'
const LOAD_QUESTIONS = 'LOAD_QUESTIONS'

function persistReducer(state = { }, action) {
  switch (action.type) {
    case LOAD_PERSIST:
      return action.state

    case SET_PERSIST:
      return R.mergeDeepRight(state, action.data)

    case INTRO_COMPLETED:
      return {
        ...state,
        introCompleted: true,
      }

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

function roleReducer(state = '', action) {
  switch (action.type) {
    case UPDATE_ROLE:
      return action.role
    default:
      return state
  }
}

function questionReducer(state = [], action) {
  switch (action.type) {
    case LOAD_QUESTIONS:
      return action.questions
    default:
      return state
  }
}

const reducer = combineReducers({
  persist: persistReducer,
  comments: commentsReducer,
  role: roleReducer,
  questions: questionReducer,
})

const store = createStore(reducer)

const mapStateToProps = state => ({ role: state.role })

class MainView extends React.Component {
  constructor(props) {
    super(props)

    this.handleSurveyPanelClick = this.handleSurveyPanelClick.bind(this)
    this.handleCommentPanelClick = this.handleCommentPanelClick.bind(this)
    this.toggleTagElementState = this.toggleTagElementState.bind(this)
    this.handleElementTagged = this.handleElementTagged.bind(this)
    this.unsetTaggedElement = this.unsetTaggedElement.bind(this)

    const {
      surveyPanelIsHidden = true,
      commentPanelIsHidden = true,
    } = getSession()

    this.state = {
      surveyPanelIsHidden,
      commentPanelIsHidden,
      surveyButtonAnimation: false,
      commentButtonAnimation: false,
      taggingModeActive: false,
      taggedElementXPath: '',
    }
  }

  componentDidUpdate() {
    const { surveyPanelIsHidden, commentPanelIsHidden } = this.state
    updateSession({ surveyPanelIsHidden, commentPanelIsHidden })
  }


  handleSurveyPanelClick() {
    this.setState(state => ({
      surveyPanelIsHidden: !state.surveyPanelIsHidden,
    }))

    if (this.state.surveyPanelIsHidden) {
      this.setState({ surveyButtonAnimation: true })
      setTimeout(() => {
        this.setState({ surveyButtonAnimation: false })
      }, 3000)
    }

    if (isMobileViewport() && !this.state.commentPanelIsHidden) {
      this.setState({ commentPanelIsHidden: true })
    }
  }

  handleCommentPanelClick() {
    this.setState(state => ({
      commentPanelIsHidden: !state.commentPanelIsHidden,
    }))

    if (this.state.commentPanelIsHidden) {
      this.setState({ commentButtonAnimation: true })
      setTimeout(() => {
        this.setState({ commentButtonAnimation: false })
      }, 3000)
    }

    if (isMobileViewport() && !this.state.surveyPanelIsHidden) {
      this.setState({ surveyPanelIsHidden: true })
    }
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
      surveyPanelIsHidden,
      commentPanelIsHidden,
      surveyButtonAnimation,
      commentButtonAnimation,
      taggingModeActive,
    } = this.state

    return (
      <div
        className={css('feedback-app-container', { 'tagging-mode-active': taggingModeActive })}
      >
        <OpenSurveyPanelButton
          hidden={!surveyPanelIsHidden}
          onClick={this.handleSurveyPanelClick}
          animation={surveyButtonAnimation}
        />
        <OpenCommentPanelButton
          hidden={!commentPanelIsHidden}
          onClick={this.handleCommentPanelClick}
          animation={commentButtonAnimation}
        />
        { this.props.role === 'dev' ? (
          <DashboardLink />
        ) : null
        }
        <SurveyPanel
          hidden={surveyPanelIsHidden}
          onClick={this.handleSurveyPanelClick}
        />
        <CommentPanel
          taggedElementXPath={this.state.taggedElementXPath}
          unsetTaggedElement={this.unsetTaggedElement}
          toggleTagElementState={this.toggleTagElementState}
          hidden={commentPanelIsHidden}
          onClick={this.handleCommentPanelClick}
        />
        <Onboarding />
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover
        />
      </div>
    )
  }
}

const ConnectedMainView = connect(mapStateToProps)(MainView)

const getComments = () => {
  apiCall('GET', '/comments')
    .then((comments) => {
      store.dispatch(loadComments(comments))
    })
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
        const { id, secret } = await apiCall('POST', '/users',
          { name: state.name }, { noUser: true })

        console.log('Created new user from API', { [id]: secret })

        store.dispatch(setPersistData({ users: { [id]: secret } }))
      } else {
        console.log('Loaded user from persistent storage', state.users)
      }

      let { role } = await apiCall('GET', '/users/role')

      if (DEV) {
        if (window.location.host.includes('.dev.')) role = 'dev'
      }

      console.log('User role:', role)
      store.dispatch(updateRole(role))

      if (state.introCompleted && !state.acceptCookies) {
        showCookieToast(store.dispatch.bind(store))
      }
    }
  }

  const savePersist = setupPersist(loadPersist)

  getComments()

  store.subscribe(() => {
    const persist = store.getState().persist || { }
    savePersist(persist)
    setUsers(persist.users || { })
    setUserName(persist.name)
  })

  subscribeUpdateUsers((newUsers) => {
    store.dispatch(setPersistData({ users: newUsers }))
  })

  apiCall('GET', '/comments')
    .then((comments) => {
      store.dispatch(loadComments(comments))
    })

  const root = prepareReactRoot()

  Modal.setAppElement(root)

  ReactDOM.render(
    <Provider store={store}>
      <ConnectedMainView />
    </Provider>,
    root
  )
}

let route = window.location.pathname
const updateComments = () => {
  if (route !== window.location.pathname) {
    getComments()
  }
  route = window.location.pathname
}

setInterval(updateComments, 100)

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
