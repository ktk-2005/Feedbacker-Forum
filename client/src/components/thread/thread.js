import React from 'react'
import * as R from 'ramda'

import classNames from 'classnames/bind'

import Comment from '../comment/comment'

import styles from './thread.scss'

const css = classNames.bind(styles)

class Thread extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isExpanded: false,
    }
  }


  render() {
    const { isExpanded } = this.state
    console.log(isExpanded)
    const comment = this.props.comments[0]
    return (
      <Comment key={comment.id} comment={comment} id={comment.id} />
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

