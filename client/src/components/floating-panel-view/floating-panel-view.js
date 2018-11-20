import React from 'react'
import classNames from 'classnames/bind'
import styles from './floating-panel-view.scss'

const css = classNames.bind(styles)

const FloatingPanel = ({hidden, onClick}) => {
    return (
      <div className={hidden ? css('panel', 'hidden') : css('panel')}>
        <button
          className={css('panel-button')}
          onClick={onClick}
        >x</button>
      </div>
    )
}

export default FloatingPanel
