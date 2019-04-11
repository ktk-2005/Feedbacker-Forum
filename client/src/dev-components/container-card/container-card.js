// React and library imports
import React from 'react'
import { Link } from 'react-router-dom'
import InlineSVG from 'svg-inline-react'
import Moment from 'react-moment'
import moment from 'moment'
// Helpers
import classNames from 'classnames/bind'
import ConfirmModal from '../../feedbacker-components/confirm-modal/confirm-modal'
import apiCall from '../../api-call'
import { shareSlack } from '../../globals'
// Styles
import styles from './container-card.scss'
import '../../scss/atoms/_toast.scss'
// Icons
import DeleteIcon from '../../assets/svg/baseline-delete-24px.svg'
import StartIcon from '../../assets/svg/baseline-cloud_queue-24px.svg'
import StopIcon from '../../assets/svg/baseline-cloud_off-24px.svg'
import SlackIcon from '../../assets/svg/baseline-slack-24px.svg'

const css = classNames.bind(styles)

class ContainerCard extends React.Component {
  constructor(props) {
    super(props)
    this.instance = this.props.instance
    this.instance.url = `//${this.instance.subdomain}.${window.location.host}`
    this.instance.name = this.instance.subdomain

    const { blob } = this.instance
    if (blob.path) {
      this.instance.url += blob.path
      this.instance.origin += blob.path
    }

    this.state = {
      containerRunning: this.instance.running,
      startPending: false,
      stopPending: false,
      removePending: false,
      disableSlack: false,
      deleteModalIsOpen: false,
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
      this.props.removeContainerCallback()
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

    const typeText = instance.runner === 'site' ? 'External site' : 'Instance'

    return (
      <div key={instance.id} className={css('instance-card')}>
        <div className={css('header-container')}>
          <div className={css('header-button-container')}>
            {instance.runner !== 'site' ? (
              <>
                {this.state.containerRunning
                  ? (
                    <button
                      type="button"
                      disabled={!this.state.containerRunning || this.isOperationPending()}
                      onClick={this.stopContainer}
                      data-tooltip="Stop"
                      className={css('start-or-stop')}
                    >
                      <InlineSVG src={StopIcon} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={this.state.containerRunning || this.isOperationPending()}
                      onClick={this.startContainer}
                      data-tooltip="Start"
                      className={css('start-or-stop')}
                    >
                      {<InlineSVG src={StartIcon} />}
                    </button>
                  )}
              </>
            ) : null}
            <button
              type="button"
              disabled={this.isOperationPending()}
              onClick={() => this.setState({ deleteModalIsOpen: true })}
              data-tooltip="Delete"
            >
              <InlineSVG src={DeleteIcon} />
            </button>
          </div>
          <h5>{typeText}: {instance.subdomain}</h5>
        </div>
        {this.instance.origin ? (
          <p>
            Go to source {instance.runner === 'site' ? 'site' : 'repo'}: <a href={this.instance.origin}>{new URL(this.instance.origin).hostname.split('.').reverse()[1]}</a>
          </p>
        ) : null}
        <p>
          <span>Created on: </span>
          <Moment
            className={css('timestamp')}
            date={instance.time}
            format="D.MM.YYYY HH.mm"
          />
          <span>,&nbsp;</span>{moment(instance.time).fromNow()}
        </p>
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
          {instance.runner !== 'site' ? (
            <Link to={`/logs/${instance.subdomain}`} tabIndex="-1">
              Open instance logs
            </Link>
          ) : null}
          <a
            href={this.instance.url}
            target="_blank"
            rel="noreferrer noopener"
            className={css('accent')}
          >
            Go to feedbackable UI
          </a>
        </div>
        <ConfirmModal
          text="Are you sure you want to delete this instance?"
          action={this.removeContainer}
          isOpen={this.state.deleteModalIsOpen}
          toggle={() => this.setState({ deleteModalIsOpen: false })}
          className={css('deleteModal')}
        />
      </div>
    )
  }
}

export default ContainerCard
