import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/build-view.scss'
import * as R from 'ramda'

const css = classNames.bind(styles)

class Build extends React.Component {
  constructor(props) {
    super(props)

    this.logPolling = this.logPolling.bind(this)

    this.state = {
      data: [],
    }
  }

  componentDidMount() {
    this.logPolling()
    this.timer = setInterval(() => this.logPolling(), 2000)
  }

  logPolling() {
    fetch('/api/instances/logs/')
      .then(response => response.text())
      .then(data => this.setState({ data }))
    console.log('BANANA SLAMA!')
  }

  render() {
    return (
      <div className={css('build-view-container')}>
        <h3>Build...</h3>
        <div className={css('log-container')}>
          {this.state.data}
        </div>
      </div>
    )
  }
}

export default Build
