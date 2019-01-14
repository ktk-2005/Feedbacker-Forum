import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import classNames from 'classnames/bind'
import * as R from 'ramda'
import Button from './components/open-panel-button/open-panel-button'
import FloatingPanel from './components/floating-panel-view/floating-panel-view'
import { setupPersist } from './persist'
import { apiUrl } from './meta/env.meta'
import Reactions from './components/emoji-reactions/emoji-reactions'

import styles from './scss/_base.scss'
import { connect, Provider } from 'react-redux';

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
  comments: commentsReducer
})

const store = createStore(reducer)

const feedbackAppRoot = () => {
  const feedbackAppRoot = document.createElement('div')
  feedbackAppRoot.setAttribute('data-feedback-app-root', true)
  document.body.appendChild(feedbackAppRoot)
  return feedbackAppRoot
}

const mapStateToProps = (state) => {
  return { comments: state.comments }
}

function Comments(props) {
  return R.map(([id, comment]) => <Reactions reactions={comment.reactions} comment_id={id} />, R.toPairs(props.comments))
}

const ConnectedComments = connect(mapStateToProps)(Comments)

class MainView extends React.Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      panelIsHidden: true,
      buttonIsHidden: false,
      reactions: []
    }
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
        <ConnectedComments />
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

  fetch('/api/comments')
    .then(x => x.json())
    .then(comments => {
      store.dispatch({type: LOAD_ALL, comments})
    })

  store.subscribe(() => {
    savePersist(store.getState().persist || { })
    console.log(store.getState())
  })

  ReactDOM.render(
    <Provider store={store}>
      <div className={css('feedback-app-main-container')}>
        <MainView />
      </div>
    </Provider>,
    feedbackAppRoot()
  )
}

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
