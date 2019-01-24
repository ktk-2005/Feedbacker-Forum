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
}) => {
  return (
    <div>
      {questions.map((question, index) => (
        <SurveyCreateQuestion
          key={question.id}
          index={index}
          question={question}
          edited={index === editIndex}
          onSelect={() => handleSelect(index)}
          onDeselect={() => handleSelect(-1)}
          onEdit={change => handleEdit(index, change)}
        />
      ))}
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
    this.handleNew = this.handleNew.bind(this)
    this.handleSortStart = this.handleSortStart.bind(this)
    this.handleSortEnd = this.handleSortEnd.bind(this)

    this.state = {
      questions: [
        { id: 'a', text: 'Hello world!' },
        { id: 'b', text: 'What is this' },
        { id: 'c', text: 'More of this stuff' },
      ],
      editIndex: -1,
    }
  }

  handleQuestionSelect(index) {
    this.setState({ editIndex: index })
  }

  handleQuestionEdit(index, change) {
    this.setState(({questions}) => ({
      questions: R.adjust(index, R.mergeLeft(change), questions)
    }))
  }

  handleSortStart() {
    this.setState({ editIndex: -1 })
  }

  handleSortEnd({ oldIndex, newIndex }) {
    this.setState(({questions}) => ({
      questions: arrayMove(questions, oldIndex, newIndex),
    }))
  }

  handleNew() {
    mutex.attempt(async () => {
      const predict = { id: '(pending)', text: '', type: 'text' }
      this.setState(({ questions }) => {
        questions: R.append(predict, questions)
        editIndex: questions.length,
      })

      await apiCall('POST', '/questions')
      const questions = await apiCall('GET', '/questions')

      this.setState({ questions })
    })
  }

  render() {
    const { hidden, onClick } = this.props
    const { questions, editIndex } = this.state

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
              editIndex={editIndex}
              handleSelect={this.handleQuestionSelect}
              handleEdit={this.handleQuestionEdit}

              useDragHandle
              lockAxis="y"
              helperContainer={shadowModalRoot}
              helperClass={css('drag-helper')}
              onSortStart={this.handleSortStart}
              onSortEnd={this.handleSortEnd}
            />

            <button enabled={mutex.free} onClick={this.handleNew}>Add question</button>

          </div>
        </Draggable>
      </div>
    )
  }
}

export default SurveyCreatePanel

