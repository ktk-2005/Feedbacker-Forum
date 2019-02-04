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
    this.expandedThread = this.expandedThread.bind(this)
  }

  handleClick() {
    const isOpen = (this.props.currentThread === this.props.id)
    this.props.updateCurrentThread(isOpen ? '' : this.props.id)
  }

  buttonText() {
    const openText = this.props.comments.length > 1 ? 'Expand' : 'Reply'
    const isOpen = this.props.currentThread !== this.props.id
    return isOpen ? openText : 'Collapse'
  }

  expandedThread(op) {
    if (this.props.currentThread !== this.props.id) { return }
    const threadComments = this.props.comments.slice(1)
    const sortByTime = R.sortBy(comment => comment.time)
    const sortedComments = sortByTime(threadComments)
    return (
      <>
        {sortedComments.map(
          comment => (
            <Comment
              key={comment.id}
              comment={comment}
              id={comment.id}
              role={this.props.role}
              op={op}
            />
          ),
        )}
        <SubmitField
          handleSubmit={this.props.handleSubmit}
          threadId={this.props.id}
        />
      </>
    )
  }

  render() {
    const { role } = this.props
    const sortByTime = R.sortBy(comment => comment.time)
    const firstComment = sortByTime(this.props.comments)[0]
    return (
      <div className={css('thread')}>
        <Comment
          key={firstComment.id}
          comment={firstComment}
          id={firstComment.id}
          role={role}
        />
        <div className={css('expand-button-container')}>
          <button
            type="button"
            onClick={this.handleClick}
          >
            { this.buttonText() }
          </button>
        </div>
        <aside className={css('sub-thread')}>
          { this.expandedThread(firstComment.userId) }
        </aside>
      </div>
    )
  }
}

export default Thread

