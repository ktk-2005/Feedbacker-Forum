import React from 'react'
import classNames from 'classnames/bind'
import styles from './floating-panel-view.scss'

const css = classNames.bind(styles)

const FloatingPanel = ({visible, onClick}) => {
    return (
      <div className={visible ? css('panel') : css('hidden')}>
        <button
          className={css('panelButton')}
          onClick={onClick}
        >x</button>
      </div>
    )
}

export default FloatingPanel
