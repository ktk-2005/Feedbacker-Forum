import React from 'react'
import Draggable from 'react-draggable'
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import styles from './floating-panel-view.scss'
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'

const css = classNames.bind(styles)

class comment extends React.Component {
  render() {
    const { hidden } = this.mapStateToProps

    return (
      <div className={hidden ? css('comment-container', 'hidden') : css('comment-container')}>

    )
  }
}
