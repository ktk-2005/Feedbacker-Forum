import React from 'react'
import * as R from 'ramda'
import classNames from 'classnames/bind'

import styles from './survey-edit-card.scss'

const css = classNames.bind(styles)

function TextDisplay({ question, onOpen }) {
  const answers = question.answers
  const answersText = 'Show ' + answers.length + ' answer' + (answers.length == 1 ? '' : 's')

  return (
    <a className={css('answer-text')} onClick={onOpen}>{answersText}</a>
  )
}

function OptionDisplay({ question }) {
  const answers = question.answers
  const counts = R.countBy(R.prop('option'))(answers)

  return (
    <ul>
      <li>Yes: {counts[0] || 0}</li>
      <li>No: {counts[1] || 0}</li>
    </ul>
  )
}

export default class SurveyEditCard extends React.Component {

  constructor(props) {
    super(props)

    this.doOpen = this.doOpen.bind(this)
  }

  doOpen() {
    const { onOpen, question } = this.props
    onOpen(question.id)
  }

  render() {
    const { question, onOpen } = this.props
    const answers = question.answers

    const dataDisplay = {
      text: () => ( <TextDisplay question={question} onOpen={this.doOpen} /> ),
      binary: () => ( <OptionDisplay question={question} /> ),
      info: () => ( <div /> ),
    }

    const display = dataDisplay[question.type]()

    return (
      <div className={css('survey-edit-card')}>

        <div className={css('header')}>
          <span className={css('grippy')}>........</span>
          <h4>{question.text}</h4>
          <div className={css('filler')} />
          <button>E</button>
          <button>X</button>
        </div>

        <div className={css('display-area')}>
          { display }
        </div>
      </div>
    )
  }

}

