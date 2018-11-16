import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'

import { setupPersist } from './persist'

function persistReducer(state = { }, action) {
  switch (action.type) {
    case 'LOAD_PERSIST':
      return action.state

    case 'SET_PERSIST':
      return { ...state, ...action.data }

    default:
      return state
  }
}

const reducer = combineReducers({
  persist: persistReducer,
})

const store = createStore(reducer)

const savePersist = setupPersist((state) => {
  store.dispatch({ type: 'LOAD_PERSIST', state })
})
store.subscribe(() => {
  savePersist(store.getState().persist || { })

  console.log((store.getState().persist || {}).name)
})

function click() {
  store.dispatch({
    type: 'SET_PERSIST',
    data: { name: 'Hello!' + new Date().toString() }
  })
}

class VersionInfo extends React.Component {
  constructor() {
    super()
    this.state = { versionString: '...' }
  }

  async componentDidMount() {
    const response = await fetch('/api/version')
    const version = await response.json()
    const shortHash = version.gitHash.substring(0, 8)
    const versionString = `${shortHash} (${version.gitBranch})`
    this.setState({ versionString })
  }

  render() {
    const { versionString } = this.state
    return (
      <div>Version: {versionString}</div>
    )
  }
}

ReactDOM.render(
  <div>
    <VersionInfo />
    <button onClick={click}>Update!</button>
  </div>,
  document.getElementById('root')
)

