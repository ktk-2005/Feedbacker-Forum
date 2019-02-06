import React from 'react'
import * as R from 'ramda'
import { SortableContainer, arrayMove } from 'react-sortable-hoc'

import Draggable from 'react-draggable'
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import styles from './survey-create-panel.scss'
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'
import SurveyCreateQuestion from './survey-create-question.js'
import { shadowModalRoot } from '../../shadowDomHelper'
import apiCall from '../../api-call'
import Mutex from '../../mutex'

const css = classNames.bind(styles)

const SortableSurveyList = SortableContainer(({
  questions,
  editIndex,
  handleSelect,
  handleEdit,
  handleDelete,
  edit,
  disabled,
}) => {
  return (
    <div>
      {questions.map((question, index) => {
        const id = question.id
        const edited = id === edit.id

        const editedQuestion = edited ? { ...question, ...edit } : question

        return (<SurveyCreateQuestion
          key={question.id}
          index={index}
          question={editedQuestion}
          edited={edited}
          onSelect={() => handleSelect(id)}
          onDeselect={() => handleSelect(null)}
          onDelete={() => handleDelete(id)}
          onEdit={change => handleEdit(id, change)}
          disabled={disabled}
          disabled_={disabled}
          deleted={edited && edit.deleted}
        />)
      })}
    </div>
  )
})

// eslint-disable-next-line react/prefer-stateless-function
class SurveyCreatePanel extends React.Component {

  constructor(props) {
    super(props)

    this.mutex = new Mutex()
    this.handleQuestionEdit = this.handleQuestionEdit.bind(this)
    this.handleQuestionSelect = this.handleQuestionSelect.bind(this)
    this.handleQuestionDelete = this.handleQuestionDelete.bind(this)
    this.handleNew = this.handleNew.bind(this)
    this.handleSortStart = this.handleSortStart.bind(this)
    this.handleSortEnd = this.handleSortEnd.bind(this)
    this.mutexListener = this.mutexListener.bind(this)
    this.editMirror = { }

    this.state = {
      questions: [],
      edit: { },
      mutexFree: false,
    }
  }

  componentDidMount() {
    this.mutex.queue(async () => {
      const questions = await apiCall('GET', '/questions')
      await this.setStateAsync({ questions })
    })

    this.mutex.connectFree(this.mutexListener)
  }

  componentWillUnmount() {
    this.mutex.disconnectFree(this.mutexListener)
  }

  mutexListener(free) {
    this.setState({ mutexFree: free })
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    })
  }

  handleQuestionSelect(id) {
    this.mutex.queue(async () => {
      const { edit } = this.state
      let questions = null

      if (edit.id && edit.modified) {
        try {
          await apiCall('PUT', `/questions/${edit.id}`, this.state.edit)
          questions = await apiCall('GET', '/questions')
        } catch (err) { /* Nop */ }
      }

      if (id) {
        await this.setStateAsync({ edit: { id } })
      } else {
        await this.setStateAsync({ edit: { } })
      }

      if (questions) {
        await this.setStateAsync({ questions })
      }
    })
  }

  handleQuestionEdit(id, change) {
    this.setState(({questions}) => ({
      edit: { id, modified: true, ...change },
    }))
  }

  handleSortStart() {
    this.setState({ edit: { } })
  }

  handleSortEnd({ oldIndex, newIndex }) {
    this.setState(({questions}) => ({
      questions: arrayMove(questions, oldIndex, newIndex),
    }))
  }

  async handleNew() {
    this.mutex.attempt(async () => {
      const predict = { id: '(pending)', text: '', type: 'text' }
      this.setState(({ questions }) => ({
        questions: R.append(predict, questions),
        edit: { id: '(pending)' },
      }))

      const { id: newId } = await apiCall('POST', '/questions')
      const questions = await apiCall('GET', '/questions')

      await this.setStateAsync(({ edit }) => ({ questions, edit: { ...edit, id: newId } }))
    })
  }

  async handleQuestionDelete(id) {
    this.mutex.attempt(async () => {
      this.setState(({ edit }) => ({ edit: { ...edit, id, deleted: true } }))
      await apiCall('DELETE', `/questions/${id}`)
      const questions = await apiCall('GET', '/questions')
      await this.setStateAsync({ questions, edit: { } })
    })
  }

  render() {
    const { hidden, onClick } = this.props
    const { questions, edit, mutexFree } = this.state

    return (
      <div className={css('panel-container', { hidden })}>
        <Draggable
          defaultPosition={{ x: 10, y: 10 }}
          position={null}
          handle="[data-dragarea]"
        >
          <div className={css('panel')}>

            <div
              data-dragarea="true"
              className={css('panel-header')}
            >
              <h5 className={css('heading')}>Create a Survey</h5>
            </div>

            <SortableSurveyList
              questions={questions}
              edit={edit}
              handleSelect={this.handleQuestionSelect}
              handleEdit={this.handleQuestionEdit}
              handleDelete={this.handleQuestionDelete}
              disabled={!mutexFree}

              useDragHandle
              lockAxis="y"
              helperContainer={shadowModalRoot}
              helperClass={css('drag-helper')}
              onSortStart={this.handleSortStart}
              onSortEnd={this.handleSortEnd}
            />

            <button disabled={!mutexFree} onClick={this.handleNew}>Add question</button>

          </div>
        </Draggable>
      </div>
    )
  }
}

export default SurveyCreatePanel

