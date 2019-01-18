import React from 'react'
// Helpers
import classNames from 'classnames/bind'
import apiCall from './api-call'
// Styles
import styles from './scss/views/build-view.scss'

const css = classNames.bind(styles)

class Build extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      data: '',
    }
  }

  componentDidMount() {
    this.logPolling()
    this.timer = setInterval(() => this.logPolling(), 2000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
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
    const url = `http://${name}.localhost:8080`

    return (
      <div className={css('center-center-block')}>
        <div className={css('build-view')}>
          <h2>Container status: </h2>
          <div className={css('log-container')}>
            <pre>
              {this.state.data}
            </pre>
          </div>
          <div className={css('next-action-container')}>
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
