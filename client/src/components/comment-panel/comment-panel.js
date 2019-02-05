import React from 'react'
import { connect } from 'react-redux'
import * as R from 'ramda'
// Helpers
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import { shadowDocument } from '../../shadowDomHelper'
import * as DomTagging from '../../dom-tagging'
import { loadComments } from '../../actions'

// Components
import Thread from '../thread/thread'
import apiCall from '../../api-call'
import SubmitField from '../submit-field/submit-field'
// Styles
import commentPanelStyles from './comment-panel.scss'
// Assets
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'



const css = classNames.bind(commentPanelStyles)

const mapStateToProps = state => ({
  comments: state.comments,
  users: (state.persist || {}).users || {},
  role: state.role,
})

class CommentPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentThread: '',
      isHidden: false,
    }

    this.updateCurrentThread = this.updateCurrentThread.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.fetchComments = this.fetchComments.bind(this)
    this.deleteComment = this.deleteComment.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
  }

  updateCurrentThread(threadId) {
    this.setState({ currentThread: threadId })
  }

  async handleSubmit(event, value, threadId) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()

    if (value === '') return // Don't post empty comment

    const getBlob = () => {
      const xPath = this.props.taggedElementXPath
      if (xPath) {
        return { xPath }
      }
      return {}
    }

    const unhighlightTaggedElement = () => {
      const { xPath } = getBlob()
      if (xPath) DomTagging.toggleHighlightElement(DomTagging.getElementByXPath(xPath))
    }

    await apiCall('POST', '/comments', {
      text: value,
      blob: getBlob(),
      threadId: threadId || null,
    })
    unhighlightTaggedElement()
    this.props.unsetTaggedElement()
    await this.fetchComments()
  }

  handleClick() {
    this.setState(state => ({
      isHidden: !state.isHidden,
    }))
  }

  async fetchComments() {
    const comments = await apiCall('GET', '/comments')
    this.props.dispatch(loadComments(comments))
    await this.scrollToBottom()
  }

  async deleteComment(comment) {
    if (Object.keys(this.props.users)[0] === comment.userId) {
      await apiCall('DELETE', '/comments', { commentId: comment.id })
      await this.fetchComments()
    }
  }

  scrollToBottom() {
    const el = shadowDocument().getElementById('thread--container')
    if (el) el.scrollTop = el.scrollHeight
  }

  threadContainer() {
    if (R.isEmpty(this.props.comments)) return (<p>No comments fetched.</p>)
    const threadIds = new Set(Object.values(this.props.comments).map(comment => comment.threadId))
    const groupByThread = R.groupBy((comment) => {
      for (const id of threadIds) {
        if (comment.threadId === id) {
          return id
        }
      }
    })
    const threadArray = groupByThread(Object.values(this.props.comments))
    const sortbyTime = R.sortBy(([id, comments]) => R.reduce(
      R.minBy(comment => comment.time),
      { time: '9999-99-99 99:99:99' },
      comments
    ).time)
    const sortedThreads = sortbyTime(R.toPairs(threadArray))
    return (
      <div className={css('thread-container')} id="thread--container">
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
                deleteComment={this.deleteComment}
              />),
            sortedThreads
          )
        }
      </div>
    )
  }

  render() {
    return (
      <div className={css('panel-container', 'comment-panel', { hidden: this.state.isHidden })}>
        <div className={css('panel-header')}>
          <h5 className={css('heading')}>Comments</h5>
          <button
            type="button"
            className={css('close-button')}
            onClick={this.handleClick}
          >
            <InlineSVG src={CloseIcon} />
          </button>
        </div>
        <div className={css('panel-body')}>
          { this.threadContainer() }
          <SubmitField
            handleSubmit={this.handleSubmit}
            threadId=""
          />
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(CommentPanel)
