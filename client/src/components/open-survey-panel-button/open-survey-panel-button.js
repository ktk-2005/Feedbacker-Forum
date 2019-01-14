import React from 'react'
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import styles from './open-survey-panel-button.scss'
import OpenIcon from '../../assets/svg/baseline-add-24px.svg'

const css = classNames.bind(styles)

const OpenSurveyPanelButton = ({ hidden, onClick }) => (
  <button
    type="button"
    className={hidden ? css('button', 'hidden') : css('button')}
    onClick={onClick}
  >
    <InlineSVG src={OpenIcon} />
  </button>
)

export default OpenSurveyPanelButton
