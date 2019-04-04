import React from 'react'
import * as R from 'ramda'

import classNames from 'classnames/bind'

import Comment from '../comment/comment'
import SubmitField from '../submit-field/submit-field'

import styles from './thread.scss'

const css = classNames.bind(styles)

class Thread extends React.Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.buttonText = this.buttonText.bind(this)
    this.expandedThread = this.expandedThread.bind(this)
    this.canDelete = this.canDelete.bind(this)
    this.replyField = React.createRef()
  }

  handleClick() {
    const isOpen = (this.props.currentThread === this.props.id)
    this.props.updateCurrentThread(isOpen ? '' : this.props.id)
  }

  buttonText() {
    let openText = 'Reply'
    const replyAmount = this.props.comments.length - 1
    if (replyAmount > 0) {
      openText = `Show ${replyAmount} Repl${replyAmount === 1 ? 'y' : 'ies'}`
    }
    const isOpen = this.props.currentThread !== this.props.id
    return isOpen ? openText : 'Collapse'
  }

  threadIsExpanded() {
    return this.props.currentThread !== this.props.id
  }

  expandedThread(op) {
    if (this.threadIsExpanded()) { return }
    const sortByTime = R.sortBy(comment => comment.time)
    const sortedComments = sortByTime(this.props.comments)
    const threadComments = sortedComments.slice(1)
    return (
      <>
        {
          threadComments.map(
            comment => (
              <Comment
                key={comment.id}
                comment={comment}
                id={comment.id}
                role={this.props.role}
                op={op}
                onClick={() => this.replyField.current.focus()}
                buttonText="Reply"
                canDelete={this.canDelete(comment.userId)}
                deleteComment={this.props.deleteComment}
                hidePanel={this.props.hidePanel}
                updateTagButtonStatus={this.props.updateTagButtonStatus}
                highlighted={comment.id === this.props.highlightedId}
              />
            ),
          )
        }
        <SubmitField
          handleSubmit={this.props.handleSubmit}
          threadId={this.props.id}
          inputRef={this.replyField}
          toggleTagElementState={this.props.toggleTagElementState}
        />
      </>
    )
  }

  canDelete(commentUserId) {
    const { users } = this.props
    return users.hasOwnProperty(commentUserId) || this.props.role === 'dev'
  }

  render() {
    const { role, hidePanel } = this.props
    const sortByTime = R.sortBy(comment => comment.time)
    const firstComment = sortByTime(this.props.comments)[0]

    return (
      <div className={css('thread')}>
        <Comment
          key={firstComment.id}
          comment={firstComment}
          id={firstComment.id}
          role={role}
          onClick={this.handleClick}
          buttonText={this.buttonText()}
          canDelete={this.canDelete(firstComment.userId)}
          deleteComment={this.props.deleteComment}
          hidePanel={hidePanel}
          updateTagButtonStatus={this.props.updateTagButtonStatus}
          highlighted={this.props.highlightedId === firstComment.id}
        />
        <aside className={css('sub-thread', { 'expanded-thread': this.threadIsExpanded() })}>
          {this.expandedThread(firstComment.userId)}
        </aside>
      </div>
    )
  }
}

export default Thread
