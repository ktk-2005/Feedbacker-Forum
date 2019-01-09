import React from 'react'
import Draggable from 'react-draggable'
import {connect} from 'react-redux'
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import styles from './floating-panel-view.scss'
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'

const css = classNames.bind(styles)

class FloatingPanel extends React.Component {
  render() {
    const { hidden, onClick } = this.props

    return (
      <div className={hidden ? css('panel-container', 'hidden') : css('panel-container')}>
        <Draggable
          defaultPosition={{ x: 10, y: 10 }}
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
                className={css('close-button')}
                onClick={onClick}
              >
                <InlineSVG src={CloseIcon} />
              </button>
            </div>
          </div>
        </Draggable>
      </div>
    )
  }
}

export default FloatingPanel
