import React from 'react'
import * as R from 'ramda'
// Helpers
import classNames from 'classnames/bind'
import apiCall from './api-call'
import { subscribeUsers, unsubscribeUsers } from './globals'
import { shadowDocument } from './shadowDomHelper'
// Styles
import styles from './scss/views/create-runner.scss'

const css = classNames.bind(styles)

class CreateRunner extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      instanceRunners: [],
    }

    this.getInstanceRunnersFromServer = this.getInstanceRunnersFromServer.bind(this)
    this.deleteRunner = this.deleteRunner.bind(this)
  }

  componentDidMount() {
    this.userSub = subscribeUsers(this.getInstanceRunnersFromServer)
  }

  componentWillUnmount() {
    unsubscribeUsers(this.userSub)
  }

  async getInstanceRunnersFromServer() {
    const response = await apiCall('GET', '/instanceRunners')

    this.setState({ instanceRunners: response })
  }

  async postNewInstanceRunner(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    const doc = shadowDocument()
    const inputValue = name => doc.getElementById(name).value

    await apiCall('POST', '/instanceRunners/new', { tag: inputValue('tag'), name: inputValue('name') })
  }

  async deleteRunner(tag) {
    await apiCall('POST', '/instanceRunners/delete', { tag })
    this.setState((prevState) => {
      const instancesWithoutDeletedOne = R.reject(
        runner => runner.id === tag, prevState.instanceRunners
      )
      return instancesWithoutDeletedOne
    })
  }

  render() {
    return (
      <>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Size</th>
              <th>User</th>
              <th>Created</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {this.state.instanceRunners.map(runner => (<RunnerRow
              key={runner.tag}
              runner={runner}
              deleteRunnerCallback={this.deleteRunner}
            />
            )) }
          </tbody>
        </table>

        <form onSubmit={this.postNewInstanceRunner}>
          <input type="text" name="tag" id="tag" />
          <input type="text" name="name" id="name" />
          <button type="submit">Create</button>
        </form>
      </>
    )
  }
}

function RunnerRow(props) {
  const { runner, deleteRunnerCallback } = props
  return (
    <tr>
      <td>{runner.tag}</td>
      <td>{runner.name}</td>
      <td>{runner.size}</td>
      <td>{runner.user_id}</td>
      <td>{runner.date}</td>
      <td>{runner.status}</td>
      <td><button type="button" onClick={() => deleteRunnerCallback(runner.tag)}>Delete</button></td>
    </tr>
  )
}

export default CreateRunner
