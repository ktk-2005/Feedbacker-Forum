import React from 'react'
// Helpers
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'
import apiCall from './api-call'
import { subscribeUsers, unsubscribeUsers } from './globals'
// Styles
import styles from './scss/views/build-view.scss'

const css = classNames.bind(styles)

class Build extends React.Component {
  constructor(props) {
    super(props)

    this.logPolling = this.logPolling.bind(this)

    this.state = {
      data: '',
    }
  }

  componentDidMount() {
    this.userSub = subscribeUsers(this.logPolling)
    this.timer = setInterval(this.logPolling, 2000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
    unsubscribeUsers(this.userSub)
  }

  async logPolling() {
    const { name } = this.props.match.params
    const response = await apiCall('GET', `/instances/logs/${name}`, null, {
      rawResponse: true,
    })
    const text = await response.text()
    if (response.status < 400) {
      this.setState({ data: text })
    } else {
      console.error('Failed to get logs', text)
    }
  }

  render() {
    const { name } = this.props.match.params
    const url = `https://${name}.${window.location.host}`

    return (
      <div className={css('center-center-block')}>
        <div className={css('build-view')}>
          <h2>Container status: </h2>
          <div className={css('log-container')}>
            <pre>
              {this.state.data}
            </pre>
          </div>
          <div className={css('button-container')}>
            <Link to="/">
              <button
                className={css('dashboard-button')}
                type="button"
              >Back to dashboard
              </button>
            </Link>
            <label>
              Feedbackable UI:
              <a href={url} target="_blank" rel="noopener noreferrer" className={css('container-link')}>{url}</a>
            </label>
          </div>
        </div>
      </div>
    )
  }
}

export default Build
