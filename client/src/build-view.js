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
      <div className={css('build-view-container')}>
        <h3>Build...</h3>
        <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
        <div className={css('log-container')}>
          <pre>
            {this.state.data}
          </pre>
        </div>
      </div>
    )
  }
}

export default Build
