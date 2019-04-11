import React from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
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
    this.getUrlParameter = this.getUrlParameter.bind(this)

    this.state = {
      instances: [],
      slackAuth: false,
    }
  }

  async componentDidMount() {
    this.userSub = subscribeUsers(this.refreshInstances)
    const { slackAuth } = await apiCall('GET', '/slack/auth')
    this.setState({ slackAuth })
    if (this.getUrlParameter('slackError').length !== 0) {
      toast('Slack authentication failed.', {
        autoClose: 2000,
      })
    } else if (this.getUrlParameter('slackOk').length !== 0) {
      toast('Signed in with Slack.', {
        autoClose: 2000,
      })
    }
  }

  componentWillUnmount() {
    unsubscribeUsers(this.userSub)
  }

  getUrlParameter(key) {
    const newKey = key.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
    const regex = new RegExp(`[\\?&]${newKey}=([^&#]*)`)
    const res = regex.exec(window.location.search)
    return res === null ? '' : decodeURIComponent(res[1].replace(/\+/g, ' '))
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
            <Link to="/create" tabIndex="-1">
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
