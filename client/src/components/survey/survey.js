import React from 'react'
// Helpers
import classNames from 'classnames/bind'
import apiCall from '../../api-call'
// Components
import Question from './question'
import Answer from './answer'
// Styles
import styles from './survey.scss'

const css = classNames.bind(styles)

class Survey extends React.Component {
  constructor(props) {
    super(props)

    this.nextQuestion = this.nextQuestion.bind(this)
    this.previousQuestion = this.previousQuestion.bind(this)

    this.state = {
      questions: [],
      currentIndex: 0,
    }
  }

  async componentDidMount() {
    const questions = await apiCall('GET', '/questions')
    this.setState(state => ({
      ...state,
      questions,
    }))
  }

  nextQuestion() {
    this.setState(state => ({
      ...state,
      currentIndex: Math.min(state.questions.length - 1, state.currentIndex + 1),
    }))
  }

  previousQuestion() {
    this.setState(state => ({
      ...state,
      currentIndex: Math.max(0, state.currentIndex - 1),
    }))
  }

  buttons() {
    const { questions, currentIndex } = this.state
    const hasNext = currentIndex < questions.length - 1
    const hasPrevious = currentIndex > 0
    return (
      <div className={css('button-container')}>
        {
          hasPrevious ? (
            <button type="button" className={css('previous-question')} onClick={this.previousQuestion}>
              Previous
            </button>
          ) : null
        }
        {
          hasNext ? (
            <button type="button" className={css('next-question')} onClick={this.nextQuestion}>
              Next
            </button>
          ) : null
        }
      </div>
    )
  }

  render() {
    const { questions, currentIndex } = this.state
    if (this.state.questions.length < 1) {
      // TODO: unnecessary state as should not be openable if empty
      return <h3>No survey available</h3>
    } else {
      return (
        <div className={css('survey-container')}>
          <Question
            question={questions[currentIndex]}
            current={currentIndex}
          />
          <Answer
            key={currentIndex}
            question={questions[currentIndex]}
          />
          { this.buttons() }
        </div>
      )
    }
  }
}

export default Survey
