import React from 'react'
import ReactModal from 'react-modal'

import classNames from 'classnames/bind'

import { shadowModalRoot } from '../../shadowDomHelper'

import styles from './confirm-modal.scss'

const css = classNames.bind(styles)

const ConfirmModal = ({ text, action, isOpen, toggle }) => (
  <ReactModal
    className={css('confirm-modal')}
    isOpen={isOpen}
    parentSelector={shadowModalRoot}
    overlayClassName={css('confirm-overlay')}
    onRequestClose={toggle}
    shouldFocusAfterRender
    shouldCloseOnOverlayClick
    shouldCloseOnEsc
  >
    <h3>{text}</h3>
    <div className={css('button-container')}>
      <button
        type="button"
        className={css('confirm-button')}
        onClick={() => {
          action()
          toggle()
        }
        }
      >
        Yes
      </button>
      <button
        type="button"
        className={css('confirm-button')}
        onClick={toggle}
      >
        No
      </button>
    </div>
  </ReactModal>
)

export default ConfirmModal
