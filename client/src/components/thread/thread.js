import React from 'react'

import classNames from 'classnames/bind'

import Comment from '../comment/comment'
import SubmitField from '../submit-field/submit-field'

import styles from './thread.scss'

const css = classNames.bind(styles)

class Thread extends React.Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.expandedThread = this.expandedThread.bind(this)
  }

  handleChange(event) {
    this.props.onChange(event)
    this.props.updateCurrentThread(this.props.id)
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

  expandedThread() {
    if (this.props.currentThread !== this.props.id) { return }
    const threadComments = this.props.comments.slice(1)
    return (
      <>
        {threadComments.map(
          comment => <Comment key={comment.id} comment={comment} id={comment.id} />,
        )}
        <SubmitField
          value={this.props.value}
          onSubmit={this.props.onSubmit}
          onChange={this.handleChange}
        />
      </>
    )
  }

  render() {
    const comment = this.props.comments[0]
    return (
      <div className={css('thread')}>
        <Comment key={comment.id} comment={comment} id={comment.id} />
        <div className={css('expand-button-container')}>
          <button
            type="button"
            onClick={this.handleClick}
          >
            { this.buttonText() }
          </button>
        </div>
        <aside className={css('sub-thread')}>
          { this.expandedThread() }
        </aside>
      </div>
    )
  }
}

export default Thread

