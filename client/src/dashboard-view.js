import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Route, Link } from 'react-router-dom'
import styles from './scss/views/dashboard-view.scss'
import Create from './create'

const css = classNames.bind(styles)

const mapStateToProps = (state) => {
  const users = (state.persist || {}).users || {}
  const userKeys = Object.keys(users)
  let publicKey = ''
  let privateKey = ''
  if (userKeys.length >= 1) {
    publicKey = userKeys[0]
    privateKey = users[publicKey]
  }
  return {
    userPublic: publicKey,
    userPrivate: privateKey,
    users,
  }
}

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      instances: [],
    }
  }

  componentDidMount() {
    fetch('/api/instances', {
      headers: {
        Authorization: `Feedbacker ${btoa(JSON.stringify(this.props.users))}`,
      },
    })
      .then(response => response.json())
      .then(instances => this.setState({ instances }))
  }

  render() {
    const { instances } = this.state

    return (
      <div className={css('dashboard')}>
        <div className={css('top-section')}>
          <Link to="/site/create">
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
              const instanceUrl = `${instance.subdomain}.${window.location.host}`

              return (
                <div key={instance.id} className={css('instance-card')}>
                  <h5>{instance.subdomain}</h5>
                  <a
                    href={instanceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={css('ui-link')}
                  >
                    Go to UI
                  </a>
                </div>
              )
            })
          }
        </div>
        <Route path="/site/create" component={Create} />
      </div>
    )
  }
}

export default connect(mapStateToProps)(Dashboard)
