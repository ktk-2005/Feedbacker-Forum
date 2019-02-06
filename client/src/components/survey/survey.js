import React from 'react'
import { connect } from 'react-redux'
// Helpers
import classNames from 'classnames/bind'
import apiCall from '../../api-call'
import { loadQuestions } from '../../actions'
// Components
import Question from './question'
import Answer from './answer'
// Styles
import styles from './survey.scss'

const css = classNames.bind(styles)

const mapStateToProps = state => ({
  questions: state.questions,
})

class Survey extends React.Component {
  constructor(props) {
    super(props)

    this.nextQuestion = this.nextQuestion.bind(this)
    this.previousQuestion = this.previousQuestion.bind(this)

    this.state = {
      currentIndex: 0,
    }
  }

  async componentDidMount() {
    const questions = await apiCall('GET', '/questions')
    this.props.dispatch(loadQuestions(questions))
  }

  nextQuestion() {
    this.setState(state => ({
      ...state,
      currentIndex: Math.min(this.props.questions.length - 1, state.currentIndex + 1),
    }))
  }

  previousQuestion() {
    this.setState(state => ({
      ...state,
      currentIndex: Math.max(0, state.currentIndex - 1),
    }))
  }

  buttons() {
    const { currentIndex } = this.state
    const { questions } = this.props
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
    const { currentIndex } = this.state
    const { questions } = this.props
    if (questions.length < 1) {
      // NOT UNNECESSARY STATE
      // TODO: 3. make progress bar hover to show tooltip with percent progress and steps
      return <h3>No survey available</h3>
    } else {
      return (
        <div className={css('survey-container')}>
          <div className={css('progress-container')}>
            <div className={css('progress-bar')} data-progress-percents={Math.round(100 * (currentIndex + 1) / questions.length)} />
          </div>
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

export default connect(mapStateToProps)(Survey)
