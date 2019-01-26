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

    this.state = {
      value: '',
      prevAnswer: {},
    }
  }

  async componentDidMount() {
    let prevAnswer = await apiCall('GET', `/answers/${this.props.question.id}`)
    prevAnswer = prevAnswer.length === 0 ? {} : prevAnswer[0]
    if (prevAnswer.blob.text) {
      this.setState({value: prevAnswer.blob.text})
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

  async handleTextSubmit(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    // TODO: check if post or update
    await apiCall('POST', '/answers', {
      questionId: this.props.question.id,
      blob: { text: this.state.value },
    })
    this.setState(state => ({
       // value: '',
       prevAnswer: { blob: { text: state.value } },
      }))
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
      return (
        <div>
          <form>

          </form>
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
