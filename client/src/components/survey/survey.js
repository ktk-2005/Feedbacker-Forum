import React from 'react'
import { connect } from 'react-redux'
// Helpers
import classNames from 'classnames/bind'
import * as R from 'ramda'
import apiCall from '../../api-call'
import { loadQuestions } from '../../actions'
import { fakeQuestions } from './fake-survey-data'
// Components
import Question from './question'
import Answer from './answer'
// Styles
import styles from './survey.scss'

const css = classNames.bind(styles)

const mapStateToProps = (state) => {
  const persist = state.persist || {}
  return ({
    questions: state.questions,
    onboarding: !R.isEmpty(persist.users) && !persist.introCompleted,
    dev: !R.isEmpty(persist.users) && state.role === 'dev',
  })
}

class Survey extends React.Component {
  constructor(props) {
    super(props)

    this.nextQuestion = this.nextQuestion.bind(this)
    this.previousQuestion = this.previousQuestion.bind(this)
    this.checkOnboarding = this.checkOnboarding.bind(this)

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

  checkOnboarding() {
    let { currentIndex } = this.state
    let { questions } = this.props
    const { onboarding, dev } = this.props
    if (onboarding && !dev) {
      currentIndex = 0
      questions = fakeQuestions
    }
    return {
      currentIndex,
      questions,
    }
  }

  buttons() {
    const { currentIndex, questions } = this.checkOnboarding()
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
    const { currentIndex, questions } = this.checkOnboarding()
    if (questions.length > 0) {
      const progressPercents = Math.round(100 * (currentIndex + 1) / questions.length)
      return (
        <div className={css('survey-container')}>
          <div className={css('progress-container')}>
            <div className={css('progress-bar')} data-progress-percents={progressPercents} />
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
    } else {
      return null
    }
  }
}

export default connect(mapStateToProps)(Survey)
