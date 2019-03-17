// React and library imports
import React from 'react'
import { Link } from 'react-router-dom'
import InlineSVG from 'svg-inline-react'
// Helpers
import classNames from 'classnames/bind'
import apiCall from '../../api-call'
// Styles
import { shareSlack } from '../../globals'
import styles from './container-card.scss'
import '../../scss/atoms/_toast.scss'
// Icons
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'
import StartIcon from '../../assets/svg/baseline-play_arrow-24px.svg'
import StopIcon from '../../assets/svg/baseline-stop-24px.svg'
import SlackIcon from '../../assets/svg/baseline-slack-24px.svg'

const css = classNames.bind(styles)

class ContainerCard extends React.Component {
  constructor(props) {
    super(props)
    this.instance = this.props.instance
    this.instance.url = `//${this.instance.subdomain}.${window.location.host}`
    this.instance.name = this.instance.subdomain

    this.state = {
      containerRunning: this.instance.running,
      startPending: false,
      stopPending: false,
      removePending: false,
      disableSlack: false,
    }

    this.startContainer = this.startContainer.bind(this)
    this.stopContainer = this.stopContainer.bind(this)
    this.removeContainer = this.removeContainer.bind(this)
  }

  isOperationPending() {
    return this.state.startPending || this.state.stopPending || this.state.removePending
  }

  async removeContainer() {
    this.setState({ removePending: true })
    try {
      await apiCall('POST', '/instances/delete', { name: this.instance.name })
      this.props.removeContainerCallback(this.instance.name)
    } catch (error) {
      this.setState({ removePending: false })
    }
  }

  async startContainer() {
    this.setState({ startPending: true })
    try {
      await apiCall('POST', '/instances/start', { name: this.instance.name }, { rawResponse: true })
      this.setState({ containerRunning: true })
    } catch (error) {
      // nop
    } finally {
      this.setState({ startPending: false })
    }
  }

  async stopContainer() {
    this.setState({ stopPending: true })
    try {
      await apiCall('POST', '/instances/stop', { name: this.instance.name }, { rawResponse: true })
      this.setState({ containerRunning: false })
    } catch (error) {
      // nop
    } finally {
      this.setState({ stopPending: false })
    }
  }

  render() {
    const { instance } = this.props

    return (
      <div key={instance.id} className={css('instance-card')}>
        <div className={css('header-container')}>
          <div className={css('header-button-container')}>
            {instance.runner !== 'site' ? (
              <>
                <button
                  type="button"
                  disabled={this.state.containerRunning || this.isOperationPending()}
                  onClick={this.startContainer}
                  data-tooltip="Start"
                >
                  {<InlineSVG src={StartIcon} />}
                </button>
                <button
                  type="button"
                  disabled={!this.state.containerRunning || this.isOperationPending()}
                  onClick={this.stopContainer}
                  data-tooltip="Stop"
                >
                  <InlineSVG src={StopIcon} />
                </button>
              </>
            ) : null}
            <button
              type="button"
              disabled={this.isOperationPending()}
              onClick={this.removeContainer}
              data-tooltip="Remove"
              data-tooltip-width="100px"
            >
              <InlineSVG src={CloseIcon} />
            </button>
          </div>
          <h5>Instance: {instance.subdomain}</h5>
        </div>
        <div className={css('button-container')}>
          {this.props.slackAuth
            ? (
              <button
                type="button"
                className={css('slack-share')}
                disabled={this.state.disableSlack}
                onClick={() => shareSlack(
                  this,
                  `${this.instance.name}.${window.location.host}`,
                  apiCall
                )}
                data-tooltip="Share in Slack"
                data-tooltip-width="130px"
              >
                {<InlineSVG src={SlackIcon} />}
              </button>)
            : null}
          <Link to={`/logs/${instance.subdomain}`}>
            Open instance logs
          </Link>
          <a
            href={this.instance.url}
            target="_blank"
            rel="noreferrer noopener"
            className={css('accent')}
          >
            Go to feedbackable UI
          </a>
        </div>
      </div>
    )
  }
}

export default ContainerCard
