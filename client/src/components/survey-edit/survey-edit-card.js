import React from 'react'
import * as R from 'ramda'
import classNames from 'classnames/bind'
import { SortableElement, SortableHandle } from 'react-sortable-hoc'

import styles from './survey-edit-card.scss'

const css = classNames.bind(styles)

function TextDisplay({ question, onOpen }) {
  const answers = question.answers || []
  const answersText = 'Show ' + answers.length + ' answer' + (answers.length == 1 ? '' : 's')

  return (
    <button className={css('answer-text')} onClick={onOpen}>{answersText}</button>
  )
}

function OptionDisplay({ question }) {
  const { answers, options } = question
  const counts = R.countBy(R.prop('option'))(answers || [])

  return (
    <ul>{
      options.map((option, index) => (
        <li key={index}>{option}: {counts[index] || 0}</li>
      ))
    }</ul>
  )
}

function focusTextEnd(event) {
  console.log('ASD')
  const temp = event.target.value
  event.target.value = ''
  event.target.value = temp
}

function OptionEdit({ question, onEditChange, onKeyPress, commit }) {
  const { options } = question

  const handleChange = index => (event) => {
    const text = event.target.value.replace(/[\r\n\t]/g, '')
    onEditChange(question.id, {
      options: R.update(index, text, options)
    })
  }

  return (
    <ul>{
      options.map((option, index) => (
        <li key={index} >
          <input
            type="text"
            value={option}
            placeholder={`Option ${index + 1}`}
            tabIndex="2"
            onChange={handleChange(index)}
            onKeyPress={onKeyPress}
            disabled={commit}
          />
        </li>
      ))
    }</ul>
  )
}

const Handle = SortableHandle(() => (
  <span className={css('grippy')}>........</span>
))

function Answer({ answer }) {
  const { text, name } = answer

  return (
    <div>
      <p>{text}</p>
      <p>{name ? name : 'Anonymous'}</p>
      <hr />
    </div>
  )
}

function AnswerDisplay({ answers }) {
  return answers.map(answer => <Answer answer={answer} />)
}

class SurveyEditCard extends React.Component {

  constructor(props) {
    super(props)

    this.doOpen = this.doOpen.bind(this)
    this.doClose = this.doClose.bind(this)
    this.doDelete = this.doDelete.bind(this)
    this.doEditBegin = this.doEditBegin.bind(this)
    this.doEditEnd = this.doEditEnd.bind(this)
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

  handleTextEdit(event) {
    const { onEditChange, question } = this.props
    const text = event.target.value.replace(/[\r\n\t]/g, '')
    onEditChange(question.id, { text })
  }

  handleKeyPress(event) {
    if (event.keyCode == 13) {
      // Enter: End edit
      this.doEditEnd()
    }
  }

  render() {
    const { question: originalQuestion, edit, onEditChange, opened } = this.props

    const edited = edit.id === originalQuestion.id
    const question = edited ? R.mergeDeepRight(originalQuestion, edit) : originalQuestion

    const answers = question.answers || []
    const commit = edited && edit.commit

    const dataDisplay = {
      text: () => ( <TextDisplay question={question} onOpen={this.doOpen} /> ),
      option: () => ( <OptionDisplay question={question} /> ),
      info: () => ( <div /> ),
    }

    const dataEdit = {
      text: () => ( <div /> ),
      option: () => ( <OptionEdit question={question} onEditChange={onEditChange} onKeyPress={this.handleKeyPress} commit={commit} /> ),
      info: () => ( <div /> ),
    }

    const display = edited ? dataEdit[question.type]() : dataDisplay[question.type]()

    return (
      <div className={css('survey-edit-card', { 'edit-commit': commit } )}>

        <div className={css('header')}>

          {edited ? (
            <>
              <textarea
                value={question.text}
                onChange={this.handleTextEdit}
                placeholder="Write a question..."
                autoFocus
                tabIndex="1"
                onKeyPress={this.handleKeyPress}
                disabled={commit}
              />
              <button
                type="button"
                onClick={this.doEditEnd}
                tabIndex="4"
                disabled={commit}
              >OK</button>
            </>
          ) : !opened ? (
            <>
              <Handle />
              <h4>{question.text}</h4>
              <div className={css('filler')} />
              <button type="button" onClick={this.doEditBegin} >E</button>
              <button type="button" onClick={this.doDelete}>X</button>
            </>
          ) : (
            <>
              <h4>{question.text}</h4>
              <div className={css('filler')} />
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

