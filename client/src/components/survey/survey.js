import React from 'react'
import apiCall from '../../api-call'
import Question from './question'
import Answer from './answer'
import classNames from 'classnames/bind'
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
    return (
      <div>
        {currentIndex > 0 ?
          <button className={css('previous-question')} onClick={this.previousQuestion}>PREVIOUS</button> :
          <div></div>}
        {currentIndex < questions.length - 1 ?
          <button className={css('next-question')} onClick={this.nextQuestion}>NEXT</button> :
          <div></div>}
      </div>
    )
  }

  render() {
    const { questions, currentIndex } = this.state
    if (this.state.questions.length < 1) {
      return (
        <div>
          <h1>No survey available</h1>
        </div>
      )
    } else {
      return (
        <div>
          <Question
            question={questions[currentIndex]}
            current={currentIndex}
            length={questions.length}
          />
          <Answer
            question={questions[currentIndex]}
          />
          {this.buttons()}
        </div>
      )
    }
  }
}

export default Survey
