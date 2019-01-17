import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/build-view.scss'
import * as R from 'ramda'

const css = classNames.bind(styles)

class Build extends React.component {
  constructor(props) {
    super(props)

    this.state = {
      data: [],
    }

    this.logPolling = this.logPolling.bind(this)
  }

  logPolling() {
    while (true) {
      fetch("/api/instances/logs")
      .then(response => response.json())
      .then(data =>
        this.setState
        }
    }
  }

  render() {
    return (
      <div className={css('build-view-container')}>
        <h3>Build...</h3>
        <button
          type = "button"
          onClick={logPolling}
        >logPolling
        </button>
      </div>
    )
  }
}

export default Build
