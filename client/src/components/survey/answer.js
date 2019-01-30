import React from 'react'
import classNames from 'classnames/bind'
import styles from './survey.scss'
import apiCall from '../../api-call'

const css = classNames.bind(styles)

class Answer extends React.Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleTextSubmit = this.handleTextSubmit.bind(this)
    this.submit = this.submit.bind(this)
    this.handleBinarySubmit = this.handleBinarySubmit.bind(this)
    this.handlePosBinarySubmit = this.handlePosBinarySubmit.bind(this)
    this.handleNegBinarySubmit = this.handleNegBinarySubmit.bind(this)

    this.state = {
      value: '',
      binary: { answered: false, answer: false },
      prevAnswer: {},
    }
  }

  async componentDidMount() {
    let prevAnswer = await apiCall('GET', `/answers/${this.props.question.id}`)
    prevAnswer = prevAnswer.length === 0 ? {} : prevAnswer[0]
    console.log("prev",prevAnswer)
    if (prevAnswer.blob && prevAnswer.blob.text) {
      this.setState({ value: prevAnswer.blob.text })
    } else if (prevAnswer.blob && prevAnswer.blob.binary) {
      this.setState({ binary: { answered: true, answer: prevAnswer.blob.binary.answer } })
    }
    this.setState(state => ({
      ...state,
      prevAnswer,
    }))
  }

  handleChange(event) {
    this.setState({
      value: event.target.value,
    })
  }

  async submit(blob) {
    const { prevAnswer } = this.state
    if (prevAnswer && prevAnswer.blob && (prevAnswer.blob.text || prevAnswer.blob.binary)) {
      await apiCall('PUT', `/answers/${this.props.question.id}`, {
        blob,
      })
    } else {
      await apiCall('POST', '/answers', {
        questionId: this.props.question.id,
        blob,
      })
    }
  }

  async handleTextSubmit(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    const blob = { text: this.state.value }
    await this.submit(blob)
    this.setState(state => ({
       // value: '',
       prevAnswer: { ...state.prevAnswer, blob },
      }))
  }

  async handleBinarySubmit(answer) {
    const binary = { answered: true, answer }
    const blob = { binary: { answer } }
    await this.submit(blob)
    this.setState(state => ({
      binary,
      prevAnswer: { ...state.prevAnswer, blob: { binary: { answer: binary.answer } } }
    }))
  }

  async handlePosBinarySubmit(event) {
    // event.preventDefault()
    // event.nativeEvent.stopImmediatePropagation()
    if (this.state.binary.answered && this.state.binary.answer) {
      // smth
    } else {
      await this.handleBinarySubmit(true)
    }
  }

  async handleNegBinarySubmit(event) {
    // event.preventDefault()
    // event.nativeEvent.stopImmediatePropagation()
    if (this.state.binary.answered && !this.state.binary.answer) {
      // smth
    } else {
      await this.handleBinarySubmit(false)
    }
  }

  render() {
    if (this.props.question.type === 'text') {
      // ATTEMPT TO FETCH PREVIOUS ANSWER
      const blob = this.state.prevAnswer.blob
      return (
        <div>
          <form className={css('answer-text-form')} onSubmit={this.handleTextSubmit}>
            <textarea
              value={this.state.value}
              onChange={this.handleChange}
              placeholder="Write answer..."
            />
            <input
              className={css('submit-text-answer')}
              type="submit"
              value={blob && blob.text ? "Edit answer" : "Answer"} />
          </form>
        </div>
      )
    } else if (this.props.question.type === 'binary') {
      const { binary } = this.state
      console.log("binary",binary)
      return (
        <div>
          <button type="button" className={css('binary-answer', binary.answered && binary.answer ? 'toggled' : '')} onClick={this.handlePosBinarySubmit}>Yes</button>
          <button type="button" className={css('binary-answer', binary.answered && !binary.answer ? 'toggled' : '')} onClick={this.handleNegBinarySubmit}>No</button>
        </div>
      )
    } else {
      return (
        <div>

        </div>
      )
    }
  }
}

export default Answer
