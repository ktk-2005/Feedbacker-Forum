import React from 'react'
import { Route, Link } from 'react-router-dom'
// Redux
import { connect } from 'react-redux'
// Helpers
import classNames from 'classnames/bind'
import apiCall from './api-call'
// Styles
import styles from './scss/views/dashboard-view.scss'

const css = classNames.bind(styles)

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      instances: [],
    }
  }

  async componentDidMount() {
    const instances = apiCall('/api/instances')
    this.setState({ instances })
  }

  render() {
    const { instances } = this.state

    return (
      <div className={css('dashboard')}>
        <div className={css('top-section')}>
          <Link to="/create">
            <button
              className={css('create-button')}
              type="button"
            >New instance
            </button>
          </Link>
        </div>
        <div className={css('instances-container')}>
          <h2>Your instances</h2>
          {
            instances.map((instance) => {
              const instanceUrl = `http://${instance.subdomain}.${window.location.host}`

              return (
                <div key={instance.id} className={css('instance-card')}>
                  <h5>{instance.subdomain}</h5>
                  <a
                    href={instanceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={css('ui-link')}
                  >
                    Go to feedbackable UI
                  </a>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default Dashboard
