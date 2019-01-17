import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/dashboard-view.scss'
import { Route, Link } from 'react-router-dom'
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
          <ul>
          <h2>your containers</h2>
            {instances.map(instance =>
              <li key={instance.id}>{instance.id}</li>
            )}
          </ul>
        </div>
        <Route path="/site/create" component={Create} />
      </div>
    )
  }
}

export default Dashboard
