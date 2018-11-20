import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import { connect, Provider } from 'react-redux'

import { setupPersist } from './persist'
import clientVersion from './meta/version.meta'

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
})

function versionString(version) {
  const shortHash = version.gitHash.substring(0, 8)
  return `${shortHash} (${version.gitBranch})`
}

class NameInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = { name: '', nameChanged: false }

    this.save = this.save.bind(this)
    this.change = this.change.bind(this)
  }

  getName() {
    return this.state.nameChanged ? this.state.name : this.props.name
  }

  change(e) {
    this.setState({ name: e.target.value, nameChanged: true })
  }

  save() {
    this.props.onSave(this.getName())
  }

  render() {
    const name = this.getName()
    return <>
      <input type="text" value={name} onChange={this.change} />
      <button type="button" onClick={this.save}>Save</button>
    </>
  }
}

const PersistNameInput = connect(
  state => ({ name: state.persist.name || '' }),
  dispatch => ({
    onSave: (name) => {
      dispatch({
        type: 'SET_PERSIST',
        data: { name },
      })
    },
  }),
)(NameInput)

function NameDisplay({ name, prefix }) {
  return <>{prefix}{name}</>
}

const PersistNameDisplay = connect(
  state => ({ name: state.persist.name || '' }),
)(NameDisplay)

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
  <Provider store={store}>
    <>
      <div>
        <ApiVersionInfo />
        <ClientVersionInfo version={clientVersion} />
      </div>
      <div>
        <PersistNameInput />
      </div>
      <div>
        <PersistNameDisplay prefix="Persisted name: " />
      </div>
    </>
  </Provider>,
  document.getElementById('root')
)

