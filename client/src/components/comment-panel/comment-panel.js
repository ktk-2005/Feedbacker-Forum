import React from 'react'
import { connect } from 'react-redux'
// Helpers
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import { shadowDocument } from '../../shadowDomHelper'
// Styles
import commentPanelStyles from './comment-panel.scss'
// Assets
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'

const css = classNames.bind(commentPanelStyles)

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
    this.scrollToBottom = this.scrollToBottom.bind(this)
  }

  handleChange(event) {
    this.setState({ value: event.target.value })
  }

  async handleSubmit(event) {
    event.preventDefault()
    this.setState({ value: '' })
    if (!this.props.userPublic) {
      console.error('User not found')
      return
    }

    await fetch('/api/comments', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: this.state.value,
        userId: this.props.userPublic,
        container: '',
      }),
    })

    await this.fetchComments()
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
        const commentsData = []
        // Temp solution to get comments to map
        for (const key in data) {
          if (data.hasOwnProperty(key)) commentsData.push(data[key])
        }
        // TODO: comments should be isolated to component
        const comments = commentsData.map(comment => (
          <div className={css('comment')} key={comment.id}>
            <div className={css('comment-text')}> {comment.text} </div>
            <div className={css('comment-time')}> {comment.time} </div>
          </div>
        ))
        this.setState({ comments })
        this.scrollToBottom()
      })
  }

  scrollToBottom() {
    const el = shadowDocument().getElementById('comment-container')
    console.log(el)
    if (el) el.scrollTop = el.scrollHeight
  }

  render() {
    // const { data } = this.state

    return (
      <div className={this.state.isHidden ? css('panel-container', 'comment-panel', 'hidden') : css('panel-container', 'comment-panel')}>
        <div className={css('panel-header')}>
          <h5 className={css('heading')}>Comments</h5>
          <button
            type="button"
            className={css('close-button')}
            onClick={this.handleClick}
          >
            <InlineSVG src={CloseIcon} />
          </button>
        </div>
        <div className={css('panel-body')}>
          <button
            type="button"
            className={css('show-comments')}
            onClick={this.fetchComments}
          > Show comments
          </button>
          <div className={css('comment-container')} id="comment-container">
            {this.state.comments}
          </div>
          <form className={css('comment-form')} onSubmit={this.handleSubmit}>
            <textarea
              value={this.state.value}
              onChange={this.handleChange}
              placeholder="Write comment..."
            />
            <input className={css('submit-comment')} type="submit" value="Comment" />
          </form>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(CommentPanel)
