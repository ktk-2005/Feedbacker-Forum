import React from 'react'
import classNames from 'classnames/bind'
import styles from './survey.scss'
import apiCall from '../../api-call'

const css = classNames.bind(styles)

class Answer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
  }

  handleChange(event) {
    this.setState({
      value: event.target.value,
    })
  }

  async handleTextSubmit(event) {
    event.preventDefault()
    await apiCall('POST', '/answers', {
      questionId: this.props.question.id,
      blob: { text: this.state.value },
    })
    this.setState({ value: '' })
  }

  render() {
    console.log(this.props.question)
    if (this.props.question.type === 'text') {
      return (
        <div>
          <form className={css('answer-text-form')} onSubmit={this.handleTextSubmit}>
            <textarea
              value={this.state.value}
              onChange={this.handleChange}
              placeholder="Write answer..."
            />
            <input className={css('submit-text-answer')} type="submit" value="Answer" />
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
