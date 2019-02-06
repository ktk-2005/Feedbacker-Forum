import React from 'react'

// Helpers
import classNames from 'classnames/bind'


// Styles
import submitFieldStyles from './comment-label.scss'

const css = classNames.bind(submitFieldStyles)

const CommentLabel = ({ posterRole }) => (
  <div className={css('comment-label', posterRole)}>
    {posterRole.toUpperCase()}
  </div>
)

export default CommentLabel
