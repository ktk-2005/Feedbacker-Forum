import React from 'react'

// Helpers
import classNames from 'classnames/bind'


// Styles
import submitFieldStyles from './submit-field.scss'

const css = classNames.bind(submitFieldStyles)

const SubmitField = ({ value, onChange, onSubmit }) => (
  <form className={css('comment-form')} onSubmit={onSubmit}>
    <textarea
      value={value}
      onChange={onChange}
      placeholder="Write comment..."
    />
    <input className={css('submit-comment')} type="submit" value="Comment" />
  </form>
)

export default SubmitField
