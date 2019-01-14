import React from 'react'
import ReactDOM from 'react-dom'
// Redux
import { createStore, combineReducers } from 'redux'
import { connect, Provider } from 'react-redux'
// External libraries
import * as R from 'ramda'
import retargetEvents from 'react-shadow-dom-retarget-events'
import classNames from 'classnames/bind'
// Components
import OpenSurveyPanelButton from './components/open-survey-panel-button/open-survey-panel-button'
import SurveyPanel from './components/survey-panel/survey-panel'
import CommentPanel from './components/comment-panel/comment-panel'
import { TagElementButton, initializeDomTagging } from './components/tag-element-button/tag-element-button'
import Reactions from './components/emoji-reactions/emoji-reactions'
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

const mapStateToProps = state => ({ comments: state.comments })

function Comments(props) {
  return R.map(([id, comment]) => <Reactions reactions={comment.reactions} comment_id={id} />,
    R.toPairs(props.comments))
}

const ConnectedComments = connect(mapStateToProps)(Comments)

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
      panelIsHidden: true,
      buttonIsHidden: false,
      reactions: [],
    }))
  }

  /*
  async componentDidMount() {
    let a = await fetch('/api/reactions/cb38e8f6')
    a = await a.json()
    this.setState(state => ({...state, reactions: a}))
  }
  */
  handleClick() {
    this.setState(state => ({
      ...state,
      buttonIsHidden: !state.buttonIsHidden,
      panelIsHidden: !state.panelIsHidden,
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
        <ConnectedComments />
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

  fetch('/api/comments')
    .then(x => x.json())
    .then((comments) => {
      store.dispatch({ type: LOAD_ALL, comments })
    })

  store.subscribe(() => {
    savePersist(store.getState().persist || { })
    console.log(store.getState())
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
