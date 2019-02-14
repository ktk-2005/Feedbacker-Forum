import React from 'react'
import { connect } from 'react-redux'
// Helpers
import classNames from 'classnames/bind'

// Styles
import styles from './open-survey-panel-button.scss'

const css = classNames.bind(styles)

const mapStateToProps = state => ({
  questions: state.questions,
  role: state.role,
})

const OpenSurveyPanelButton = (props) => {
  const { hidden, onClick, role, questions } = props
  const disabled = role !== 'dev' && questions.length < 1
  return (
    <button
      type="button"
      className={css('button', { hidden })}
      onClick={() => { if (!disabled) onClick() }}
      data-introduction-step="2"
      disabled={disabled}
    >
      Survey
    </button>
  )
}

export default connect(mapStateToProps)(OpenSurveyPanelButton)
