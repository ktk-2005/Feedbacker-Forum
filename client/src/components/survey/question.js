import React from 'react'
// Helpers
import classNames from 'classnames/bind'
// Styles
import styles from './survey.scss'

const css = classNames.bind(styles)

const Question = ({ question, current }) => (
  <div className={css('question')}>
    <h3>
      Question { current + 1 }
    </h3>
    <p>
      { question.text }
    </p>
  </div>
)

export default Question
