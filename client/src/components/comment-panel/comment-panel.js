import React from 'react'
import { connect } from 'react-redux'
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import styles from './comment-panel.scss'
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'

const css = classNames.bind(styles)

const mapStateToProps = (state) => {
  const users = (state.persist || {}).users || {}
  const userKeys = Object.keys(users)
  let publicKey = ''
  if (userKeys.length >= 1) {
    publicKey = userKeys[0]
  }
  return {
    userPublic: publicKey,
  }
}

class CommentPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      isHidden: false,
      comments: [],
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.fetchComments = this.fetchComments.bind(this)
  }

  handleChange(event) {
    this.setState({ value: event.target.value })
  }

  handleSubmit(event) {
    event.preventDefault()
    this.setState({ value: '' })
    if (!this.props.userPublic) {
      console.error('User not found')
      return
    }

    fetch('/api/comments', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: this.state.value,
        userId: this.props.userPublic,
        container: '',
      }),
    })
  }

  handleClick() {
    this.setState(state => ({
      isHidden: !state.isHidden,
    }))
  }

  fetchComments() {
    fetch('/api/comments')
      .then(response => response.json())
      .then((data) => {
        const comments = data.map(comment => (
          <div className={css('comment')} key={comment.id}>
            <div className={css('comment-text')}> {comment.text} </div>
            <div className={css('comment-time')}> {comment.time} </div>
          </div>
        ))
        this.setState({ comments })
      })
  }

  render() {
    const { data } = this.state

    return (
      <div className={this.state.isHidden ? css('side-panel', 'hidden') : css('side-panel')}>
        <div className={css('top')}>
          <button
            type="button"
            className={css('close-button')}
            onClick={this.handleClick}
          >
            <InlineSVG src={CloseIcon} />
          </button>
        </div>
        <div>
          <button
            type="button"
            className={css('show-comments')}
            onClick={this.fetchComments}
          > Show comments
          </button>
        </div>
        <div className={css('comment-container')}>
          {this.state.comments}
        </div>
        <form className={css('comment-form')} onSubmit={this.handleSubmit}>
          <textarea value={this.state.value} onChange={this.handleChange} />
          <input type="submit" value="Comment" />
        </form>
      </div>
    )
  }
}

export default connect(mapStateToProps)(CommentPanel)
