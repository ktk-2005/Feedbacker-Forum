import React from 'react'
import { connect } from 'react-redux'
import * as R from 'ramda'
// Helpers
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import { shadowDocument } from '../../shadowDomHelper'
import * as DomTagging from '../../dom-tagging'
import { loadComments } from '../../actions'
import RouteContainer from '../route-container/route-container'
import UsernameModal from '../add-username-modal/add-username-modal'

// Components
import Thread from '../thread/thread'
import apiCall from '../../api-call'
import SubmitField from '../submit-field/submit-field'
import ConfirmModal from '../confirm-modal/confirm-modal'
// Styles
import commentPanelStyles from './comment-panel.scss'
// Assets
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'

const css = classNames.bind(commentPanelStyles)

const mapStateToProps = state => ({
  comments: state.comments,
  users: (state.persist || {}).users || {},
  name: (state.persist || {}).name,
  role: state.role,
})

class CommentPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      usernameModalIsOpen: false,
      commentToDelete: {},
      currentThread: '',
      hide: false,
      buttonHidden: true,
      counter: 4,
    }

    this.updateCurrentThread = this.updateCurrentThread.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.toggleUsernameModal = this.toggleUsernameModal.bind(this)
    this.fetchComments = this.fetchComments.bind(this)
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this)
    this.deleteComment = this.deleteComment.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.hidePanel = this.hidePanel.bind(this)
    this.showPanel = this.showPanel.bind(this)
    this.updateCounter = this.updateCounter.bind(this)
    this.updateTagButtonStatus = this.updateTagButtonStatus.bind(this)

    this.interval = null
  }

  componentDidUpdate() {
    if (!this.interval) {
      this.interval = window.setInterval(this.fetchComments, 3000)
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      window.clearInterval(this.interval)
      this.interval = null
    }
  }

  async fetchComments() {
    const comments = await apiCall('GET', '/comments', null, {
      noToast: true,
    })
    this.props.dispatch(loadComments(comments))
  }

  updateCurrentThread(threadId) {
    this.setState({ currentThread: threadId })
  }

  async handleSubmit(event, taggedElementXPath, value, hideName, threadId) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()

    if (value.trim() === '') return // Don't post empty comment

    const getBlob = () => {
      const blob = {}
      const xPath = taggedElementXPath
      if (this.props.role === 'dev') {
        blob.dev = true
      }
      if (xPath) {
        blob.xPath = xPath
      }
      blob.route = window.location.pathname
      return blob
    }

    const unhighlightTaggedElement = () => {
      const { xPath } = getBlob()
      if (xPath) DomTagging.toggleHighlightElement(DomTagging.getElementByXPath(xPath))
    }

    await apiCall('POST', '/comments', {
      text: value,
      hideName,
      blob: getBlob(),
      threadId: threadId || null,
    })

    unhighlightTaggedElement()
    this.props.unsetTaggedElement()
    await this.fetchComments()
    if (threadId === '') this.scrollToBottom()

    if (!this.props.name && !hideName) {
      await this.toggleUsernameModal(threadId)
    } else {
      await this.fetchComments()
      if (threadId === '') this.scrollToBottom()
    }
  }

  async toggleUsernameModal(threadId) {
    if (this.state.usernameModalIsOpen) {
      await this.fetchComments()
      if (threadId === '') this.scrollToBottom()
    }
    this.setState(prevState => ({ usernameModalIsOpen: !prevState.usernameModalIsOpen }))
  }

  toggleDeleteModal(comment) {
    this.setState((prevState) => {
      if (R.isEmpty(prevState.commentToDelete)) {
        return { commentToDelete: comment }
      }
      return { commentToDelete: {} }
    })
  }

  async deleteComment() {
    const { commentToDelete: comment } = this.state
    if (this.props.users.hasOwnProperty(comment.userId) || this.props.role === 'dev') {
      await apiCall('DELETE', `/comments/${comment.id}`)
      await this.fetchComments()
    }
  }

  scrollToBottom() {
    const el = shadowDocument().getElementById('thread-container')
    if (el) el.scrollTop = el.scrollHeight
  }

  hidePanel() {
    this.setState({
      hide: true,
      buttonHidden: false,
    })

    const intervalId = setInterval(() => {
      this.updateCounter()
    }, 1000)

    this.setState({ lastIntervalId: intervalId })
  }

  updateCounter() {
    if (this.state.counter === 1) {
      this.showPanel()
    } else {
      this.setState(state => ({
        counter: state.counter - 1,
      }))
    }
  }

  showPanel() {
    clearInterval(this.state.lastIntervalId)
    this.setState({
      hide: false,
      buttonHidden: true,
      counter: 4,
      highlightedId: '',
    })
    DomTagging.clearAll()
  }

  updateTagButtonStatus(id) {
    this.setState({ highlightedId: id })
  }

  threadContainer() {
    const commentsOfRoute = R.filter(comment => comment.blob.route === window.location.pathname,
      this.props.comments)
    if (R.isEmpty(commentsOfRoute)) return (<p>No comments fetched.</p>)
    const threadIds = new Set(Object.values(commentsOfRoute).map(comment => comment.threadId))
    const groupByThread = R.groupBy((comment) => {
      for (const id of threadIds) {
        if (comment.threadId === id) {
          return id
        }
      }
    })
    const threadArray = groupByThread(Object.values(commentsOfRoute))
    const sortbyTime = R.sortBy(([comments]) => R.reduce(
      R.minBy(comment => comment.time),
      { time: '9999-99-99 99:99:99' },
      comments
    ).time)
    const sortedThreads = sortbyTime(R.toPairs(threadArray))
    return (
      <div className={css('thread-container')} id="thread-container">
        {
          R.map(
            ([id, comments]) => (
              <Thread
                key={id}
                comments={comments}
                id={id}
                users={this.props.users}
                role={this.props.role}
                handleSubmit={this.handleSubmit}
                updateCurrentThread={this.updateCurrentThread}
                currentThread={this.state.currentThread}
                deleteComment={this.toggleDeleteModal}
                toggleTagElementState={this.props.toggleTagElementState}
                hidePanel={this.hidePanel}
                updateTagButtonStatus={this.updateTagButtonStatus}
                highlightedId={this.state.highlightedId}
              />),
            sortedThreads
          )
        }
      </div>
    )
  }

  render() {
    const { onClick } = this.props
    const { hide, buttonHidden, counter } = this.state
    const hidden = this.props.hidden || hide

    return (
      <>
        <button
          type="button"
          className={css('close-mobile-mode', { buttonHidden })}
          onClick={this.showPanel}
        >
          <h3>{counter}</h3>
          <InlineSVG src={CloseIcon} />
        </button>
        <div
          className={css('panel-container', { hidden })}
        >
          <div
            className={css('comment-panel')}
            data-introduction-step="5"
          >
            <div className={css('panel-header')}>
              <h5 className={css('heading')}>Comments</h5>
              <button
                type="button"
                className={css('close-button')}
                onClick={onClick}
                data-introduction-step-close="5"
              >
                <InlineSVG src={CloseIcon} />
              </button>
            </div>
            <div className={css('panel-body')}>
              <RouteContainer comments={this.props.comments} />
              { this.threadContainer() }
              <SubmitField
                handleSubmit={this.handleSubmit}
                threadId=""
                toggleTagElementState={this.props.toggleTagElementState}
              />
              {
                !this.props.name ? (
                  <UsernameModal
                    isOpen={this.state.usernameModalIsOpen}
                    toggle={this.toggleUsernameModal}
                  />
                )
                  : null
              }
              <ConfirmModal
                text="Are you sure you want to delete this comment?"
                action={this.deleteComment}
                isOpen={!R.isEmpty(this.state.commentToDelete)}
                toggle={this.toggleDeleteModal}
              />
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default connect(mapStateToProps)(CommentPanel)
