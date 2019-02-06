import React from 'react'
import { connect } from 'react-redux'
// Helpers
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
// Assets
import OpenIcon from '../../assets/svg/baseline-add-24px.svg'
// Styles
import styles from './open-survey-panel-button.scss'

const css = classNames.bind(styles)

const mapStateToProps = state => ({
  questions: state.questions,
  role: state.role,
})

const OpenSurveyPanelButton = (props) => {
  const { hidden, onClick, questions, role } = props
  return (
    <button
      type="button"
      className={hidden ? css('button', 'hidden') : css('button')}
      onClick={onClick}
      disabled={role !== 'dev' && questions.length < 1}
    >
      <InlineSVG src={OpenIcon} />
    </button>
  )
}

export default connect(mapStateToProps)(OpenSurveyPanelButton)
