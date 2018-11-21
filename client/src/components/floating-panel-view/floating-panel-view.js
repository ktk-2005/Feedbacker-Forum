import React from 'react'
import Draggable from 'react-draggable'
import classNames from 'classnames/bind'
import styles from './floating-panel-view.scss'

const css = classNames.bind(styles)

const FloatingPanel = ({ hidden, onClick }) => (
  <Draggable
    position={null}
    handle='[data-dragarea]'
    >
    <div className={hidden ? css('panel', 'hidden') : css('panel')}>
      <div
        data-dragarea="true"
        className={css('panel-header')}
      >
        <button
          type="button"
          className={css('header-button')}
          onClick={onClick}
        >x
        </button>
      </div>
    </div>
  </Draggable>
)

export default FloatingPanel
