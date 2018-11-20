import React from 'react'
import classNames from 'classnames/bind'
import styles from '../../scss/atoms/_button.scss'
const css = classNames.bind(styles)

const Button = ({visible, onClick}) => {
  return (
    <button
      className={visible ? css('button') : css('hidden')}
      onClick={onClick}
    >+</button>
  )
}

export default Button
