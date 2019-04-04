import React from 'react'
import * as R from 'ramda'
import classNames from 'classnames/bind'
import { SortableElement, SortableHandle } from 'react-sortable-hoc'
import Moment from 'react-moment'
import moment from 'moment-timezone'

import styles from './survey-edit-card.scss'

const css = classNames.bind(styles)


function TextDisplay({ question, onOpen }) {
  const answers = question.answers || []
  const answersText = `Show ${answers.length} answer${answers.length === 1 ? '' : 's'}`

  return <button type="button" className={css('show-answers')} onClick={onOpen}>{answersText}</button>
}

function OptionDisplay({ question }) {
  const { answers, options } = question
  const counts = R.countBy(R.path(['blob', 'option']))(answers || [])

  return options.map(
    (option, index) => <div key={index}>{option}: {counts[index] || 0}</div>
  )
}

function OptionEdit({ question, onEditChange, onKeyPress, commit }) {
  const { options } = question

  const handleChange = index => (event) => {
    const text = event.target.value.replace(/[\r\n\t]/g, '')
    onEditChange(question.id, {
      options: R.update(index, text, options),
    })
  }

  return (
    <div
      className={css('options-container')}
      data-tooltip="You can edit the default options"
      data-tooltip-width="150px"
    >
      {
        options.map(
          (option, index) => (
            <input
              type="text"
              key={index}
              value={option}
              maxLength="9"
              placeholder={`Option ${index + 1}`}
              onChange={handleChange(index)}
              onKeyPress={onKeyPress}
              disabled={commit}
            />
          )
        )
      }
    </div>
  )
}

const Handle = SortableHandle(() => <div className={css('reorder-handle')} />)

function Answer({ answer }) {
  const { blob, time } = answer
  const { text } = blob

  return (
    <div className={css('answer')}>
      <div className={css('answer-meta')}>
        <Moment
          className={css('timestamp')}
          date={time}
          format="D.MM.YYYY HH:mm"
          tz={moment.tz.guess()}
        />
      </div>
      <div className={css('answer-content')}>
        <p>{text}</p>
      </div>
    </div>
  )
}

function AnswerDisplay({ answers }) {
  return answers.map(answer => <Answer key={answer.id} answer={answer} />)
}

class SurveyEditCard extends React.Component {
  constructor(props) {
    super(props)

    this.doOpen = this.doOpen.bind(this)
    this.doClose = this.doClose.bind(this)
    this.doDelete = this.doDelete.bind(this)
    this.doEditBegin = this.doEditBegin.bind(this)
    this.doEditEnd = this.doEditEnd.bind(this)
    this.doEditCancel = this.doEditCancel.bind(this)
    this.handleTextEdit = this.handleTextEdit.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  doOpen() {
    const { onOpen, question } = this.props
    onOpen(question.id)
  }

  doClose() {
    const { onClose, question } = this.props
    onClose(question.id)
  }

  doDelete() {
    const { onDelete, question } = this.props
    onDelete(question.id)
  }

  doEditBegin() {
    const { onEditBegin, question } = this.props
    onEditBegin(question.id)
  }

  doEditEnd() {
    const { onEditEnd, question } = this.props
    onEditEnd(question.id)
  }

  doEditCancel() {
    const { onEditCancel, question } = this.props
    onEditCancel(question.id)
  }

  handleTextEdit(event) {
    const { onEditChange, question } = this.props
    const text = event.target.value.replace(/[\r\n\t]/g, '')
    onEditChange(question.id, { text })
  }

  handleKeyPress(event) {
    if (event.keyCode === 13) {
      // Enter: End edit
      this.doEditEnd()
    }
  }

  render() {
    const { question: originalQuestion, edit, onEditChange, opened, busy } = this.props

    const edited = edit.id === originalQuestion.id
    const question = edited ? R.mergeDeepRight(originalQuestion, edit) : originalQuestion

    const answers = question.answers || []
    const commit = edited && edit.commit

    const dataDisplay = {
      text: () => (<TextDisplay question={question} onOpen={this.doOpen} />),
      option: () => (<OptionDisplay question={question} />),
      info: () => null,
    }

    const dataEdit = {
      text: () => null,
      option: () => (
        <OptionEdit
          question={question}
          onEditChange={onEditChange}
          onKeyPress={this.handleKeyPress}
          commit={commit}
        />
      ),
      info: () => null,
    }

    const display = edited ? dataEdit[question.type]() : dataDisplay[question.type]()

    return (
      <div className={css('survey-edit-card', { 'edit-commit': commit })}>

        <div className={css('header')}>

          {
            edited ? (
            <>
              <textarea
                value={question.text}
                onChange={this.handleTextEdit}
                placeholder={question.type !== 'text' && question.type !== 'option' ? 'Add text explanation' : 'Write a question...'}
                autoFocus
                onKeyPress={this.handleKeyPress}
                disabled={commit}
              />
              <div className={css('actions')}>
                <button
                  type="button"
                  onClick={this.doEditEnd}
                  tabIndex="-1"
                  disabled={commit}
                >Save
                </button>
                <button
                  type="button"
                  onClick={this.doEditCancel}
                  tabIndex="-1"
                  disabled={commit}
                >Cancel
                </button>
              </div>
            </>
            ) : !opened ? (
              <>
                <Handle />
                <h4>{question.text}</h4>
                <div className={css('actions')}>
                  <button disabled={busy} type="button" onClick={this.doEditBegin}>Edit</button>
                  <button disabled={busy} type="button" onClick={this.doDelete}>Remove</button>
                </div>
              </>
            ) : (
              <>
                <h4>{question.text}</h4>
                <button type="button" onClick={this.doClose}>Close</button>
              </>
            )
          }
        </div>

        { opened ? (
          <AnswerDisplay answers={answers} />
        ) : (
          <div className={css('display-area')}>
            { display }
          </div>
        ) }

      </div>
    )
  }
}

export default SortableElement(SurveyEditCard)
