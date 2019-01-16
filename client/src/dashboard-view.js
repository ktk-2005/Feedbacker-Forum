import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/dashboard-view.scss'

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
          <button
            className={css('create-button')}
            type="button"
          >Create new
          </button>
        </div>
        <div className={css('instance-container')}>
          <ul>
          <h2>your containers</h2>
            {instances.map(instance =>
              <li key={instance.id}>{instance.id}</li>
            )}
          </ul>
        </div>
      </div>
    )
  }
}

export default Dashboard
