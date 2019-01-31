import React from 'react'

// Helpers
import classNames from 'classnames/bind'


// Styles
import submitFieldStyles from './submit-field.scss'

const css = classNames.bind(submitFieldStyles)

class SubmitField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
    this.handleChange = this.handleChange.bind(this)
    this.passSubmit = this.passSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({ value: event.target.value })
  }

  passSubmit(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    this.setState({ value: '' })

    this.props.handleSubmit(event, this.state.value, this.props.threadId)
  }

  render() {
    return (
      <form className={css('comment-form')} onSubmit={this.passSubmit}>
        <textarea
          value={this.state.value}
          onChange={this.handleChange}
          placeholder="Write comment..."
        />
        <input className={css('submit-comment')} type="submit" value="Comment" />
      </form>
    )
  }
}

export default SubmitField
