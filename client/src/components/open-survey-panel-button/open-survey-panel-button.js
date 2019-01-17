import React from 'react'
// Helpers
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
// Assets
import OpenIcon from '../../assets/svg/baseline-add-24px.svg'
// Styles
import styles from './open-survey-panel-button.scss'

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
