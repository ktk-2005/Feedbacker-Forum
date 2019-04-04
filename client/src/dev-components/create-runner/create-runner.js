import React from 'react'
import { Link } from 'react-router-dom'
import * as R from 'ramda'
// Helpers
import Moment from 'react-moment'
import classNames from 'classnames/bind'
import apiCall from '../../api-call'
import { subscribeUsers, unsubscribeUsers } from '../../globals'
import { shadowDocument } from '../../shadowDomHelper'
// Styles
import styles from './create-runner.scss'

const css = classNames.bind(styles)

class CreateRunner extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      instanceRunners: [],
      defaultRunners: [],
    }

    this.getInstanceRunnersFromServer = this.getInstanceRunnersFromServer.bind(
      this
    )
    this.deleteRunner = this.deleteRunner.bind(this)
    this.postNewInstanceRunner = this.postNewInstanceRunner.bind(this)
  }

  componentDidMount() {
    this.userSub = subscribeUsers(this.getInstanceRunnersFromServer)
    this.timer = setInterval(this.getInstanceRunnersFromServer, 5000)
  }

  componentWillUnmount() {
    unsubscribeUsers(this.userSub)
    clearInterval(this.timer)
  }

  async getInstanceRunnersFromServer() {
    const response = await apiCall('GET', '/instanceRunners')
    const defaultRunners = R.filter(runner => !runner.user_id, response)
    const instanceRunners = R.filter(runner => runner.user_id, response)
    this.setState({ instanceRunners, defaultRunners })
  }

  async postNewInstanceRunner(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    const doc = shadowDocument()
    const inputValue = name => doc.getElementById(name).value

    await apiCall('POST', '/instanceRunners/new', { tag: inputValue('tag') })
    doc.getElementById('tag').value = ''
    this.getInstanceRunnersFromServer()
  }

  async deleteRunner(tag) {
    await apiCall('POST', '/instanceRunners/delete', { tag })
    this.setState((prevState) => {
      const instancesWithoutDeletedOne = R.reject(
        runner => runner.id === tag,
        prevState.instanceRunners
      )
      this.getInstanceRunnersFromServer()
      return instancesWithoutDeletedOne
    })
  }

  render() {
    const { instanceRunners } = this.state

    function noRunners() {
      if (instanceRunners.length < 1) {
        return <p>Your haven&#39;t added any custom runners yet.</p>
      }
    }

    return (
      <div className={css('runner-view-container')}>
        <div className={css('inner-container')}>
          <div className={css('runner-container')}>
            <h3>Default runners</h3>
            {this.state.defaultRunners.map(runner => (
              <DefaultRunnerRow key={runner.tag} runner={runner} />
            ))}
          </div>
          <div className={css('runner-container')}>
            <h3>Your runners</h3>
            <div className={css('runners')}>
              {instanceRunners.map(runner => (
                <RunnerRow
                  key={runner.tag}
                  runner={runner}
                  deleteRunnerCallback={this.deleteRunner}
                />
              ))}
              {noRunners()}
            </div>
          </div>
          <h3>Create a runner</h3>
          <p>
            Enter an image name discoverable on{' '}
            <a href="https://hub.docker.com/">Docker Hub</a>. The name must
            container the image version too (for example <code>latest</code>).
            The default image size limit is 50 MiB.
          </p>
          <form
            className={css('form-create-runner')}
            onSubmit={this.postNewInstanceRunner}
          >
            <label htmlFor="tag">
              Tag
              <input
                type="text"
                name="tag"
                id="tag"
                placeholder="tag:version e.g. rails:latest"
              />
            </label>
            <div className={css('button-container')}>
              <Link to="/create" tabIndex="-1">
                <button className={css('dashboard-button')} type="button">
                  Back
                </button>
              </Link>
              <button type="submit">Create</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

function RunnerRow(props) {
  const { runner, deleteRunnerCallback } = props
  return (
    <div
      className={css('runner', runner.status)}
      data-tooltip={`Status: ${runner.status}`}
      data-tooltip-width="130px"
    >
      <div className={css('runner-content')}>{runner.tag}</div>
      <div className={css('runner-content')}>
        <Moment
          className={css('timestamp')}
          date={runner.time}
          format="DD.MM.YYYY HH:mm"
        />
      </div>
      <div className={css('runner-content', 'delete')}>
        <button
          className={css('delete-button')}
          type="button"
          onClick={() => deleteRunnerCallback(runner.tag)}
          disabled={runner.status === 'pending'}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function DefaultRunnerRow(props) {
  const { runner } = props
  return <div className={css('runner', 'default')}>{runner.tag}</div>
}

export default CreateRunner
