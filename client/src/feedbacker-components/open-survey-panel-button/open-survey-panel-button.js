import React from 'react'
import { connect } from 'react-redux'
// Helpers
import classNames from 'classnames/bind'
import * as R from 'ramda'
// Styles
import styles from './open-survey-panel-button.scss'

const css = classNames.bind(styles)

const mapStateToProps = (state) => {
  const persist = state.persist || {}
  return ({
    questions: state.questions,
    role: state.role,
    onboarding: !R.isEmpty(persist.users) && !persist.introCompleted,
  })
}
const OpenSurveyPanelButton = (props) => {
  const { hidden, onClick, role, questions, onboarding, animation } = props
  const disabled = role !== 'dev' && questions.length < 1 && !onboarding
  return (
    <button
      type="button"
      className={css('button', { hidden })}
      onClick={() => { if (!disabled) onClick() }}
      data-introduction-step="2"
      disabled={disabled}
      data-animation={animation}
    >
      Survey
    </button>
  )
}

export default connect(mapStateToProps)(OpenSurveyPanelButton)
