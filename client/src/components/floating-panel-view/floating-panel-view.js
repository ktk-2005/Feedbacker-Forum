import React from 'react'
import classNames from 'classnames/bind'
import styles from './floating-panel-view.scss'

const css = classNames.bind(styles)

const FloatingPanel = ({ hidden, onClick }) => (
  <div className={hidden ? css('panel', 'hidden') : css('panel')}>
    <div className={css('panel-header')}>
      <button
        type="button"
        className={css('header-button')}
        onClick={onClick}
      >x
      </button>
    </div>
  </div>
)

export default FloatingPanel
