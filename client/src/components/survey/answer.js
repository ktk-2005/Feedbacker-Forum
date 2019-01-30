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

    this.state = {
      value: '',
      editText: false,
      binary: { answered: false, answer: false },
      prevAnswer: {},
    }
  }

  async componentDidMount() {
    let prevAnswer = await apiCall('GET', `/answers/${this.props.question.id}`)
    prevAnswer = prevAnswer.length === 0 ? {} : prevAnswer[0]
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
       editText: false,
       prevAnswer: { ...state.prevAnswer, blob },
      }))
  }

  async handleBinarySubmit(answer) {
    if (this.state.binary.answered && this.state.binary.answer === answer) {
      // Do nothing
    } else {
      const binary = { answered: true, answer }
      const blob = { binary: { answer } }
      await this.submit(blob)
      this.setState(state => ({
        binary,
        prevAnswer: { ...state.prevAnswer, blob: { binary: { answer: binary.answer } } }
      }))
    }
  }

  render() {
    if (this.props.question.type === 'text') {
      const blob = this.state.prevAnswer.blob
      return (
        <div>
          {blob && blob.text && !this.state.editText ?
            <div>
              <p>{this.state.value}</p>
              <button onClick={() => this.setState({ editText: true })}>Edit answer</button>
            </div> :
            <form className={css('answer-text-form')} onSubmit={this.handleTextSubmit}>
              <textarea
                value={this.state.value}
                onChange={this.handleChange}
                placeholder="Write answer..."
              />
              <input
                className={css('submit-text-answer')}
                type="submit"
                value={blob && blob.text ? "Save" : "Submit"} />
            </form>
          }
        </div>
      )
    } else if (this.props.question.type === 'binary') {
      const { binary } = this.state
      return (
        <div className={css('binary')}>
          <button type="button" className={css('binary-answer', binary.answered && binary.answer ? 'toggled' : '')} onClick={() => this.handleBinarySubmit(true)}>Yes</button>
          <button type="button" className={css('binary-answer', binary.answered && !binary.answer ? 'toggled' : '')} onClick={() => this.handleBinarySubmit(false)}>No</button>
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
