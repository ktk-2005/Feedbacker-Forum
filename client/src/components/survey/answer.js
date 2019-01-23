import React from 'react'
import classNames from 'classnames/bind'
import styles from './survey.scss'

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

  render() {
    if (this.props.question.blob.text) {
      return (
        <div>
          <form className={css('answer-form')} onSubmit={this.handleSubmit}>
            <textarea
              value={this.state.value}
              onChange={this.handleChange}
              placeholder="Write answer..."
            />
            <input className={css('submit-answer')} type="submit" value="Answer" />
          </form>
        </div>
      )
    }
  }
}

export default Answer
