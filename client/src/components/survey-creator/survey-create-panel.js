import React from 'react'
import * as R from 'ramda'

import Draggable from 'react-draggable'
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import styles from './survey-create-panel.scss'
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'
import SurveyCreateQuestion from './survey-create-question.js'

const css = classNames.bind(styles)

// eslint-disable-next-line react/prefer-stateless-function
class SurveyCreatePanel extends React.Component {

  constructor(props) {
    super(props)

    this.handleQuestionEdit = this.handleQuestionEdit.bind(this)
    this.handleQuestionSelect = this.handleQuestionSelect.bind(this)
    this.handleNew = this.handleNew.bind(this)

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
    console.log('SELECT', index)
    this.setState({ editIndex: index })
  }

  handleQuestionEdit(index, change) {
    const { questions } = this.state
    const edited = R.adjust(index, R.mergeLeft(change), questions)
    this.setState({ questions: edited })
  }

  handleNew() {
    const { questions } = this.state
    const question = { id: '-pending-', text: '' }
    this.setState({
      questions: R.append(question, questions),
      editIndex: questions.length,
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

            <div>
              {questions.map((question, index) => (
                <SurveyCreateQuestion
                  key={question.id}
                  question={question}
                  edited={index === editIndex}
                  onSelect={() => this.handleQuestionSelect(index)}
                  onDeselect={() => this.handleQuestionSelect(-1)}
                  onEdit={change => this.handleQuestionEdit(index, change)}
                />
              ))}
            </div>

            <button onClick={this.handleNew}>Add question</button>

          </div>
        </Draggable>
      </div>
    )
  }
}

export default SurveyCreatePanel

