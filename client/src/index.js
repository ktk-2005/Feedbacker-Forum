import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'

import { setupPersist } from './persist'
import clientVersion from './version.meta'

if (DEV) {
  (async () => {
    const response = await fetch('/api/version')
    const apiVersion = await response.json()
    if (clientVersion.gitBranch !== apiVersion.gitBranch
      || clientVersion.gitHash !== apiVersion.gitHash) {
      console.warn('Client and API versions don\'t match', clientVersion, apiVersion)
    }
  })()
}

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
    data: { name: `Hello! ${new Date().toString()}` },
  })
}

function versionString(version) {
  const shortHash = version.gitHash.substring(0, 8)
  return `${shortHash} (${version.gitBranch})`
}

class ApiVersionInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = { }
  }

  async componentDidMount() {
    const response = await fetch('/api/version')
    const version = await response.json()
    this.setState(version)
  }

  render() {
    const { ...state } = this.state
    return (
      <div>API Version: {state.gitHash ? versionString(state) : null}</div>
    )
  }
}

function ClientVersionInfo({ version }) {
  return (
    <div>Client Version: {versionString(version)}</div>
  )
}

ReactDOM.render(
  <div>
    <ApiVersionInfo />
    <ClientVersionInfo version={clientVersion} />
    <button type="button" onClick={click}>Update!</button>
  </div>,
  document.getElementById('root')
)

