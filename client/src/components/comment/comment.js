import React from 'react'
// Helpers
import classNames from 'classnames/bind'
import Moment from 'react-moment'
import moment from 'moment-timezone'
// Components
import Reactions from '../reactions/reactions'
// Styles
import styles from './comment.scss'

const css = classNames.bind(styles)

const Comment = ({ id, comment }) => (
  <div className={css('comment')} key={id}>
    <div className={css('header')}>
      <div className={css('name')}>Anonymous user</div>
      <Moment
        className={css('timestamp')}
        date={comment.time}
        format="D.MM.YYYY HH:MM"
        tz={moment.tz.guess()}
      />
    </div>
    <div className={css('body')}>
      <div className={css('text')}>
        {comment.text}
      </div>
    </div>
    <Reactions reactions={comment.reactions} commentId={id} />
  </div>
)

export default Comment
