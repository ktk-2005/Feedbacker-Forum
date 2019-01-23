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
    this.state = {
      isExpanded: false,
      buttonText: 'Reply',
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }))
    console.log('Exnpanding thread is expanded: ', this.state.isExpanded)
  }

  render() {
    const comment = this.props.comments[0]
    const { buttonText, isExpanded } = this.state
    return (
      <div className={css('thread')}>
        <Comment key={comment.id} comment={comment} id={comment.id} />
        <button
          className={css('show-thread')}
          type="button"
          onClick={this.handleClick}
        >
          { buttonText }
        </button>
        {isExpanded ? <SubmitField /> : null}
      </div>
    )
  }
}

/* threadContainer() {
  if (R.isEmpty(this.props.comments)) return (<p>No comments fetched.</p>)
  const threads = new Set(Object.values(this.props.comments).map(comment => comment.threadId)))
  const threadGroups = R.groupBy((arr) => {

  })
} */

export default Thread

