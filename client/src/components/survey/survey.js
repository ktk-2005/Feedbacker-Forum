import React from 'react'
import apiCall from '../../api-call'
import Question from './question'
import Answer from './answer'

class Survey extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      questions: [],
      currentIndex: 0,
    }
  }

  componentDidMount() {
    this.setState(async state => ({
      ...state,
      questions: await apiCall('GET', '/questions'),
    }))
  }

  changeQuestion(steps) {
    const { questions, currentIndex } = this.state
    const newIndex = Math.max(0, Math.min(questions.length, currentIndex + steps))
    this.setState(state => ({
      ...state,
      currentIndex: newIndex,
    }))
  }

  render() {
    const { questions, currentIndex } = this.state
    return (
      <div>
        <h1>SURVEY PANEL</h1>
        <Question
          question={questions[currentIndex]}
          current={currentIndex}
          length={questions.length}
        />
        <Answer
          question={questions[currentIndex]}
        />
      </div>
    )
  }
}

export default Survey
