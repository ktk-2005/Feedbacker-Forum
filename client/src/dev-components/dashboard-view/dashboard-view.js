import React from 'react'
import * as R from 'ramda'
import { Link } from 'react-router-dom'
// Helpers
import classNames from 'classnames/bind'
import apiCall from '../../api-call'
import { subscribeUsers, unsubscribeUsers } from '../../globals'
// Components
import ContainerCard from '../container-card/container-card'
import SlackSignButton from '../sign-in-slack/sign-in-slack'
// Styles
import styles from './dashboard-view.scss'


const css = classNames.bind(styles)

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.refreshInstances = this.refreshInstances.bind(this)

    this.state = {
      instances: [],
      slackAuth: false,
    }
  }

  async componentDidMount() {
    this.userSub = subscribeUsers(this.refreshInstances)
    const { slackAuth } = await apiCall('GET', '/slack/auth')
    this.setState({ slackAuth })
  }

  componentWillUnmount() {
    unsubscribeUsers(this.userSub)
  }

  async refreshInstances() {
    const instances = await apiCall('GET', '/instances')
    this.setState({ instances })
  }

  render() {
    const { instances } = this.state

    function noInstances() {
      if (instances.length === 0) {
        return (
          <p>
            No instances created.
            Go ahead and create one by clicking on the &quot;New instance&quot; button.
          </p>
        )
      }
    }

    return (
      <>
        <div className={css('top-section')}>
          <h2>Dashboard</h2>
          <div className={css('top-section-buttons')}>
            {this.state.slackAuth ? null : SlackSignButton()}
            <Link to="/create" tabindex="-1">
              <button
                className={css('create-button')}
                type="button"
              >New instance
              </button>
            </Link>
          </div>
        </div>
        <div className={css('instances-container')}>
          <h2>Your instances</h2>
          <div>
            {
              instances.reverse().map(instance => (
                <ContainerCard
                  key={instance.id}
                  removeContainerCallback={this.refreshInstances}
                  instance={instance}
                  slackAuth={this.state.slackAuth}
                />
              ))
            }
            { noInstances() }
          </div>
        </div>
      </>
    )
  }
}

export default Dashboard
