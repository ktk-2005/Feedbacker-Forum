import React from 'react'
// Helpers
import classNames from 'classnames/bind'
// Styles
import styles from './scss/views/build-view.scss'

const css = classNames.bind(styles)

class Build extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      data: null,
    }
  }

  componentDidMount() {
    this.logPolling()
    this.timer = setInterval(() => this.logPolling(), 2000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  logPolling() {
    fetch(`/api/instances/logs/${this.props.match.params.name}`)
      .then(response => response.text())
      .then(data => this.setState({ data }))
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
