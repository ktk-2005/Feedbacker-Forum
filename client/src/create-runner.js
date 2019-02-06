import React from 'react'
import { Link } from 'react-router-dom'
import * as R from 'ramda'
// Helpers
import Moment from 'react-moment'
import moment from 'moment-timezone'
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
    this.postNewInstanceRunner = this.postNewInstanceRunner.bind(this)
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

    await apiCall('POST', '/instanceRunners/new', { tag: inputValue('tag'), name: 'jee' })
    this.getInstanceRunnersFromServer()
  }

  async deleteRunner(tag) {
    await apiCall('POST', '/instanceRunners/delete', { tag })
    this.setState((prevState) => {
      const instancesWithoutDeletedOne = R.reject(
        runner => runner.id === tag, prevState.instanceRunners
      )
      this.getInstanceRunnersFromServer()
      return instancesWithoutDeletedOne
    })
  }

  render() {
    return (
      <div className={css('runner-view-container')}>
        <div className={css('create-form-container')}>
          <h2>Create a runner</h2>
          <p>This is some useful instructions. Tag should contain the version.</p>
          <form
            className={css('form-create-runner')}
            onSubmit={this.postNewInstanceRunner}
          >
            <label htmlFor="tag">
              Tag
              <input type="text" name="tag" id="tag" placeholder="tag:version" />
            </label>
            <div className={css('button-container')}>
              <Link to="/create">
                <button
                  className={css('dashboard-button')}
                  type="button"
                >Back
                </button>
              </Link>
              <button type="submit">Create</button>
            </div>
          </form>
        </div>
        <div className={css('runner-table')}>
          <h2>Your runners</h2>
          <div className={css('table-header', 'row')}>
            <div className={css('cell')}>Tag</div>
            <div className={css('cell')}>Created</div>
            <div className={css('cell')}>Status</div>
            <div className={css('cell')} />
          </div>
          <div className={css('table-body')}>
            {this.state.instanceRunners.map(runner => (<RunnerRow
              key={runner.tag}
              runner={runner}
              deleteRunnerCallback={this.deleteRunner}
            />
            )) }
          </div>
        </div>
      </div>
    )
  }
}

function RunnerRow(props) {
  const { runner, deleteRunnerCallback } = props
  const hasUser = runner.user_id
  return (
    <div className={css('row', hasUser ? '' : 'default')}>
      <span className={css('cell')}>{runner.tag}</span>
      <div className={css('cell')}>
        <Moment
          className={css('timestamp')}
          date={runner.time}
          format="DD.MM.YYYY HH:mm"
        />
      </div>
      <div className={runner.status === 'fail' ? css('cell', 'status-fail') : css('cell')}>
        {runner.status}
      </div>
      <div className={css('cell')}>
        <button
          className={css('delete-button', hasUser ? '' : 'hidden')}
          type="button"
          onClick={() => deleteRunnerCallback(runner.tag)}
        >
        Delete
        </button>
      </div>
    </div>
  )
}

export default CreateRunner
