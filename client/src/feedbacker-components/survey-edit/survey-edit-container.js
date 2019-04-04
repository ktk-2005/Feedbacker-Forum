import React from 'react'
import * as R from 'ramda'
import { SortableContainer, arrayMove } from 'react-sortable-hoc'
import InlineSVG from 'svg-inline-react'
import ReactModal from 'react-modal'
// Helpers
import classNames from 'classnames/bind'
import { shadowModalRoot } from '../../shadowDomHelper'
import apiCall from '../../api-call'
import { shareSlack } from '../../globals'
// Components
import SurveyEditCard from './survey-edit-card'
// Styles
import styles from './survey-edit-container.scss'
// Icons
import SlackIcon from '../../assets/svg/baseline-slack-24px.svg'

const css = classNames.bind(styles)

const badFunction = action => () => {
  console.error(`Cannot close ${action} now`)
  console.trace()
}

const badEditFunction = badFunction('edit')
const badOpenFunction = badFunction('open')
const badCloseFunction = badFunction('close')
const badDeleteFunction = badFunction('delete')

// ID used for questions that have not been posted to the server yet
// Must not collide with any valid question ID
const PENDING_ID = '[pending]'

const SortableSurveyEditList = SortableContainer(({
  questions,
  onOpen,
  onClose,
  onDelete,
  onEditBegin,
  onEditEnd,
  onEditCancel,
  onEditChange,
  edit,
  openId,
  busy,
}) => {
  const openQuestion = openId ? questions.find(question => question.id === openId) : null
  const openIndex = questions.indexOf(openQuestion)

  return (
    <div>{
      openQuestion ? (
        <SurveyEditCard
          index={openIndex}
          key={openQuestion.id}
          question={openQuestion}
          edit={{}}
          onOpen={badOpenFunction}
          onClose={onClose}
          onDelete={badDeleteFunction}
          onEditBegin={badEditFunction}
          onEditEnd={badEditFunction}
          onEditCancel={badEditFunction}
          onEditChange={badEditFunction}
          opened
          disabled={busy}
          busy={busy}
        />
      ) : (
        questions.map((question, index) => (
          <SurveyEditCard
            index={index}
            key={question.id}
            question={question}
            onOpen={onOpen}
            onClose={badCloseFunction}
            onDelete={onDelete}
            onEditBegin={onEditBegin}
            onEditEnd={onEditEnd}
            onEditCancel={onEditCancel}
            onEditChange={onEditChange}
            edit={edit}
            opened={false}
            disabled={busy}
            busy={busy}
          />
        ))
      )
    }
    </div>
  )
})

export default class SurveyEditContainer extends React.Component {
  constructor(props) {
    super(props)

    this.openCard = this.openCard.bind(this)
    this.closeCard = this.closeCard.bind(this)
    this.startDelete = this.startDelete.bind(this)
    this.cancelDelete = this.cancelDelete.bind(this)
    this.commitDelete = this.commitDelete.bind(this)
    this.editBegin = this.editBegin.bind(this)
    this.editEnd = this.editEnd.bind(this)
    this.editCancel = this.editCancel.bind(this)
    this.editChange = this.editChange.bind(this)
    this.sortEnd = this.sortEnd.bind(this)
    this.refetch = this.refetch.bind(this)

    this.addTextQuestion = () => this.addQuestion('text')
    this.addOptionQuestion = () => this.addQuestion('option')
    this.addInfoQuestion = () => this.addQuestion('info')

    this.state = {
      questions: [],
      openId: null,
      pendingDelete: null,
      edit: { },
      disableSlack: false,
      slackAuth: false,
    }

    this.interval = null
  }

  async componentDidMount() {
    const questions = await apiCall('GET', '/questions')
    const { slackAuth } = await apiCall('GET', '/slack/auth')
    this.setState({ questions, slackAuth })
  }

  componentDidUpdate() {
    const { open } = this.props
    if (open && !this.interval) {
      this.refetch()
      this.interval = window.setInterval(this.refetch, 10000)
    } else if (!open && this.interval) {
      window.clearInterval(this.interval)
      this.interval = null
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      window.clearInterval(this.interval)
      this.interval = null
    }
  }

  async refetch() {
    const fetchedQuestions = await apiCall('GET', '/questions', null, {
      noToast: true,
    })
    const pending = this.state.questions.filter(q => q.id === PENDING_ID)
    const questions = [...fetchedQuestions, ...pending]
    this.setState({ questions })

    const { edit, openId } = this.state
    if (edit && edit.id && !questions.some(q => q.id === edit.id)) {
      this.setState({ edit: { } })
    }
    if (openId && !questions.some(q => q.id === openId)) {
      this.setState({ openId: null })
    }
  }

  isBusy() {
    const { edit, pendingDelete, previewQuestions } = this.state
    return !!(edit.id || pendingDelete || previewQuestions)
  }

  openCard(id) {
    if (this.isBusy()) return
    this.setState({ openId: id })
  }

  closeCard(id) {
    this.setState(({ openId }) => (id === openId ? { openId: null } : { }))
  }

  startDelete(id) {
    if (this.isBusy()) return
    this.setState({ pendingDelete: id })
  }

  editBegin(id) {
    if (this.isBusy()) return

    this.setState({ edit: { id } })
  }

  async editEnd(id) {
    this.setState(({ edit }) => ({ edit: { ...edit, commit: true } }))

    const { questions, edit } = this.state
    try {
      if (edit.id !== id) throw new Error('Wrong edit ID')
      const originalQuestion = this.state.questions.find(question => question.id === id)
      if (!originalQuestion) throw new Error('Did not find original question')
      const question = R.mergeDeepRight(originalQuestion, edit)
      if (!question.text) throw new Error('Question text is empty')
      if (!question.type) throw new Error('Question type is empty')
      if (question.type === 'option') {
        if (!question.options) throw new Error('No options')
        if (!R.all(R.match(/^\s*$/))(question.options)) throw new Error('Empty option')
      }

      if (id === PENDING_ID) {
        await apiCall('POST', '/questions', question)
      } else {
        await apiCall('PUT', `/questions/${id}`, question)
      }
      const questions = await apiCall('GET', '/questions')
      this.setState({ edit: { }, questions })
    } catch (error) {
      console.error('Failed to edit question', error)
      this.setState({
        questions: questions.filter(question => question.id !== PENDING_ID),
        edit: { },
      })
    }
  }

  editCancel() {
    this.setState(({ questions }) => ({
      questions: questions.filter(question => question.id !== PENDING_ID),
      edit: {},
    }))
  }

  editChange(id, change) {
    this.setState(({ edit }) => (id === edit.id
      ? { edit: R.mergeDeepRight(edit, change) } : { }))
  }

  async sortEnd({ oldIndex, newIndex }) {
    if (this.isBusy()) return
    if (oldIndex === newIndex) return
    if (oldIndex >= this.state.questions.length) return
    if (newIndex >= this.state.questions.length) return

    try {
      // eslint-disable-next-line react/no-access-state-in-setstate
      const orderedQuestions = arrayMove(this.state.questions, oldIndex, newIndex)

      this.setState({ previewQuestions: orderedQuestions })

      const order = orderedQuestions.map(q => q.id)
      await apiCall('POST', '/questions/order', { order })

      const questions = await apiCall('GET', '/questions')

      this.setState({ previewQuestions: null, questions })
    } catch (error) {
      console.error('Failed to sort questions', error)
      this.setState({ previewQuestions: null })
    }
  }

  addQuestion(type) {
    if (this.isBusy()) return

    const id = PENDING_ID
    const question = { id, text: '', type }

    if (type === 'option') {
      question.options = ['Yes', 'No']
    }

    this.setState(({ questions, edit }) => {
      if (!R.isNil(edit.id)) return { }
      return {
        questions: [...questions, question],
        edit: { id },
      }
    })
  }

  cancelDelete() {
    this.setState({ pendingDelete: null })
  }

  async commitDelete() {
    try {
      const { pendingDelete } = this.state
      if (!pendingDelete) throw new Error('Trying to commit empty delete')
      await apiCall('DELETE', `/questions/${pendingDelete}`)
      const questions = await apiCall('GET', '/questions')
      this.setState({ questions })
    } catch (error) {
      console.error('Failed to delete question', error)
    }
    this.setState({ pendingDelete: null })
  }

  render() {
    const { openId, edit, pendingDelete } = this.state
    const questions = this.state.previewQuestions || this.state.questions

    const busy = this.isBusy()

    return (
      <>
        {questions.length > 0 ? (
          <SortableSurveyEditList
            questions={questions}
            onOpen={this.openCard}
            onClose={this.closeCard}
            onDelete={this.startDelete}
            onEditBegin={this.editBegin}
            onEditEnd={this.editEnd}
            onEditCancel={this.editCancel}
            onEditChange={this.editChange}
            edit={edit}
            openId={openId}
            busy={busy}

            useDragHandle
            lockToContainerEdges
            lockAxis="y"
            helperContainer={shadowModalRoot}
            helperClass={css('drag-helper')}
            onSortEnd={this.sortEnd}
          />
        ) : (
          <h3>No questions yet</h3>
        )}

        {
          !openId ? (
            <div className={css('add-button-container')}>
              <button
                disabled={busy}
                className={css('add-button')}
                type="button"
                onClick={this.addTextQuestion}
              >
                Add text question
              </button>
              <button
                disabled={busy}
                className={css('add-button')}
                type="button"
                onClick={this.addOptionQuestion}
              >
                Add option question
              </button>
              <button
                disabled={busy}
                className={css('add-button')}
                type="button"
                onClick={this.addInfoQuestion}
              >
                Add explanation
              </button>
              {questions.length > 0 && this.state.slackAuth ? (
                <button
                  type="button"
                  className={css('add-button', 'slack-button')}
                  disabled={this.state.disableSlack}
                  onClick={() => shareSlack(this, window.location.host, apiCall)}
                >
                  {<InlineSVG src={SlackIcon} />} <span>Share in Slack</span>
                </button>
              ) : null}
            </div>
          ) : null
        }

        <ReactModal
          isOpen={!R.isNil(pendingDelete)}
          parentSelector={shadowModalRoot}
          className={css('modal')}
          overlayClassName={css('overlay')}
        >
          <h3>Are you sure you want to delete this item?</h3>
          <div className={css('button-container')}>
            <button type="button" onClick={this.commitDelete}>Delete</button>
            <button type="button" onClick={this.cancelDelete}>Cancel</button>
          </div>
        </ReactModal>
      </>
    )
  }
}

