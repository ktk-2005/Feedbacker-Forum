import React from 'react'
import { connect } from 'react-redux'
// Helpers
import classNames from 'classnames/bind'
import apiCall from '../../api-call'
import UsernameModal from '../add-username-modal/add-username-modal'
import { keyPressSubmit } from '../../globals'
// Styles
import styles from './survey.scss'

const css = classNames.bind(styles)

const mapStateToProps = state => ({
  users: (state.persist || {}).users || {},
  name: (state.persist || {}).name,
})

class Answer extends React.Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleTextSubmit = this.handleTextSubmit.bind(this)
    this.submit = this.submit.bind(this)
    this.handleOptionSubmit = this.handleOptionSubmit.bind(this)
    this.toggleUsernameModal = this.toggleUsernameModal.bind(this)

    this.state = {
      usernameModalIsOpen: false,
      value: '',
      editText: false,
      option: { answered: false, answer: 0 },
      prevAnswer: {},
    }
  }

  async componentDidMount() {
    let prevAnswer = await apiCall('GET', `/answers/${this.props.question.id}`)
    prevAnswer = prevAnswer.length === 0 ? {} : prevAnswer[0]
    if (prevAnswer.blob && prevAnswer.blob.text) {
      this.setState({ value: prevAnswer.blob.text })
    } else if (prevAnswer.blob && prevAnswer.blob.option !== undefined) {
      this.setState({ option: { answered: true, answer: prevAnswer.blob.option } })
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
    if (
      prevAnswer
      && prevAnswer.blob
      && (prevAnswer.blob.text || prevAnswer.blob.option !== undefined)
    ) {
      await apiCall('PUT', `/answers/${this.props.question.id}`, {
        blob,
      })
    } else {
      await apiCall('POST', '/answers', {
        questionId: this.props.question.id,
        blob,
      })
    }
    if (!this.props.name) {
      this.toggleUsernameModal()
    }
  }

  async handleTextSubmit(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    if (/\S/.test(this.state.value)) {
      const blob = { text: this.state.value }
      await this.submit(blob)
      this.setState(state => ({
        // value: '',
        editText: false,
        prevAnswer: { ...state.prevAnswer, blob },
      }))
    } else {
      const { prevAnswer } = this.state
      this.setState({ value: prevAnswer && prevAnswer.blob && prevAnswer.blob.text ? prevAnswer.blob.text : '' })
    }
  }

  async handleOptionSubmit(answer) {
    if (this.state.option.answered && this.state.option.answer === answer) {
      // Do nothing, already answered and the answer hasn't changed
    } else {
      const option = { answered: true, answer }
      const blob = { option: answer }
      await this.submit(blob)
      this.setState(state => ({
        option,
        prevAnswer: { ...state.prevAnswer, blob },
      }))
    }
  }

  toggleUsernameModal() {
    this.setState(prevState => ({ usernameModalIsOpen: !prevState.usernameModalIsOpen }))
  }

  render() {
    if (this.props.question.type === 'text') {
      const { blob } = this.state.prevAnswer
      const hasAnswer = blob && blob.text && !this.state.editText
      const isDisabled = !/\S/.test(this.state.value)
      return (
        <>
          {
            hasAnswer ? (
              <div className={css('answer')}>
                <button
                  type="button"
                  className={css('edit-container')}
                  onClick={() => this.setState({ editText: true })}
                  data-answer-text={this.state.value}
                >
                  <p>
                    { this.state.value }
                  </p>
                </button>
              </div>
            ) : (
              <form
                className={css('answer-form')}
                onSubmit={this.handleTextSubmit}
              >
                <textarea
                  value={this.state.value}
                  onChange={this.handleChange}
                  placeholder="Write answer..."
                  onKeyDown={keyPressSubmit}
                />
                <input
                  className={css('submit-text-answer')}
                  type="submit"
                  disabled={isDisabled}
                  value={blob && blob.text ? 'Save' : 'Submit'}
                />
              </form>
            )
          }
          {
            !this.props.name
              ? (
                <UsernameModal
                  isOpen={this.state.usernameModalIsOpen}
                  toggle={this.toggleUsernameModal}
                />
              )
              : null
          }
        </>
      )
    } else if (this.props.question.type === 'option') {
      const { option } = this.state
      return (
        <div className={css('options')}>
          {
            this.props.question.options.map((value, index) => (
              <button
                key={value}
                type="button"
                className={css('option', option.answered && option.answer === index ? 'chosen' : '')}
                onClick={() => this.handleOptionSubmit(index)}
              >
                { value }
              </button>
            ))
          }
          {
            !this.props.name
              ? (
                <UsernameModal
                  isOpen={this.state.usernameModalIsOpen}
                  toggle={this.toggleUsernameModal}
                />
              )
              : null
          }
        </div>
      )
    } else {
      return (
        <div />
      )
    }
  }
}

export default connect(mapStateToProps)(Answer)
