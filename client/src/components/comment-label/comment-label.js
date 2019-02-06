import React from 'react'
// Helpers
import classNames from 'classnames/bind'
// Styles
import submitFieldStyles from './comment-label.scss'

const css = classNames.bind(submitFieldStyles)

const CommentLabel = ({ posterRole }) => (
  posterRole === 'op' ? (
    <>
      <div className={css('dev-label')}>
        DEV
      </div>
      <div className={css('badge-container')}>
        <div className={css('badge')}>
          <div className={css('badge')}>
            <div className={css('badge')} />
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className={css('dev-label', posterRole)}>
      {posterRole.toUpperCase()}
    </div>
  )
)

export default CommentLabel
