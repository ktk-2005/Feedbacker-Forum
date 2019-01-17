import React from 'react'
import classNames from 'classnames/bind'
import { Route, Link } from 'react-router-dom'
import styles from './scss/views/dashboard-view.scss'
import Create from './create'

const css = classNames.bind(styles)

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      instances: []
    }
  }

  componentDidMount() {
    fetch('/api/instances')
      .then(response => response.json())
      .then(instances => this.setState({ instances }))
  }

  render () {
    const { instances } = this.state

    return (
      <div className={css('dashboard')}>
        <div className={css('top')}>
          <Link to="/site/create">
            <button
              className={css('create-button')}
              type="button"
            >Create new
            </button>
          </Link>
        </div>
        <div className={css('instance-container')}>
          <h2>Your containers</h2>
            {instances.map(instance =>
              <div key={instance.id} className={css('instance')}>
                <div>{instance.id}</div>
              </div>
            )}
        </div>
        <Route path="/site/create" component={Create} />
      </div>
    )
  }
}

export default Dashboard
