import React from 'react'
import Draggable from 'react-draggable'
import classNames from 'classnames/bind'
import styles from './floating-panel-view.scss'

const css = classNames.bind(styles)

const FloatingPanel = ({ hidden, onClick }) => (
  <div className={hidden ? css('panel-container', 'hidden') : css('panel-container')}>
    <Draggable
      position={null}
      handle="[data-dragarea]"
    >
      <div className={css('panel')}>
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
  </div>
)

export default FloatingPanel
