import React from 'react'
// Helpers
import classNames from 'classnames/bind'

// Styles
import styles from './open-comment-panel-button.scss'

const css = classNames.bind(styles)

const OpenCommentPanelButton = ({ hidden, onClick, animation }) => (
  <button
    type="button"
    className={css('open-button', { hidden })}
    onClick={onClick}
    data-introduction-step="4"
    data-animation={animation}
  >Comments
  </button>
)

export default OpenCommentPanelButton
