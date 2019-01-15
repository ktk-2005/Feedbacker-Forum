import React from 'react'
import * as R from 'ramda'
import Reactions from '../emoji-reactions/emoji-reactions'

const Comments = (data, css) => {
  return R.map(([id, comment]) => (
    <div className={css('comment')} key={id}>
      <div className={css('comment-text')}> {comment.text} </div>
      <div className={css('comment-time')}> {comment.time} </div>
      <Reactions reactions={comment.reactions} comment_id={id} />
    </div>
  ), R.toPairs(data))
}

export default Comments
