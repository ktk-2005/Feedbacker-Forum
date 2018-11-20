import React from 'react'
import classNames from 'classnames/bind'
import styles from './open-panel-button.scss'

const css = classNames.bind(styles)

const Button = ({ hidden, onClick }) => (
  <button
    className={hidden ? css('button', 'hidden') : css('button')}
    onClick={onClick}
  >+
  </button>
)

export default Button
