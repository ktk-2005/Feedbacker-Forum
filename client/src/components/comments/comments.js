import React from 'react'
// Helpers
import * as R from 'ramda'
import Moment from 'react-moment'
import classNames from 'classnames/bind'
// Components
import Reactions from '../emoji-reactions/reactions'
// Styles
import styles from './comments.scss'

const css = classNames.bind(styles)

const Comments = ({ comments }) => {
  return R.map(([id, comment]) => (
    <div className={css('comment')} key={id}>
      <div className={css('header')}>
        <div className={css('name')}>Anonymous user</div>
        <Moment
          className={css('timestamp')}
          date={comment.time}
          format="D.MM.YYYY HH:MM"
        />
      </div>
      <div className={css('body')}>
        <div className={css('text')}>
          {comment.text}
        </div>
      </div>
      <Reactions reactions={comment.reactions} commentId={id} />
    </div>
  ), R.toPairs(comments))
}

export default Comments
