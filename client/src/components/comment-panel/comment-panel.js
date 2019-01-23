import React from 'react'
import { connect } from 'react-redux'
import * as R from 'ramda'
// Helpers
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import { shadowDocument } from '../../shadowDomHelper'
import * as DomTagging from '../../dom-tagging'
import { loadComments } from '../../actions'

// Components
import Thread from '../thread/thread'
import apiCall from '../../api-call'
import SubmitField from '../submit-field/submit-field'
// Styles
import commentPanelStyles from './comment-panel.scss'
// Assets
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'



const css = classNames.bind(commentPanelStyles)

const mapStateToProps = state => ({
  comments: state.comments,
  role: state.role,
})

class CommentPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      isHidden: false,
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
    event.nativeEvent.stopImmediatePropagation()

    const getBlob = () => {
      const xPath = this.props.taggedElementXPath
      if (xPath) {
        return { xPath }
      }
      return {}
    }

    const unhighlightTaggedElement = () => {
      const { xPath } = getBlob()
      if (xPath) DomTagging.toggleHighlightElement(DomTagging.getElementByXPath(xPath))
    }

    await apiCall('POST', '/comments', {
      text: this.state.value,
      blob: getBlob(),
    })
    unhighlightTaggedElement()
    this.props.unsetTaggedElement()
    this.setState({ value: '' })
    await this.fetchComments()
  }

  handleClick() {
    this.setState(state => ({
      isHidden: !state.isHidden,
    }))
  }

  async fetchComments() {
    const comments = await apiCall('GET', '/comments')
    this.props.dispatch(loadComments(comments))
    this.scrollToBottom()
  }

  scrollToBottom() {
    const el = shadowDocument().getElementById('comment-container')
    if (el) el.scrollTop = el.scrollHeight
  }

  threadContainer() {
    if (R.isEmpty(this.props.comments)) return (<p>No comments fetched.</p>)
    const threadIds = new Set(Object.values(this.props.comments).map(comment => comment.threadId))
    const groupByThread = R.groupBy((comment) => {
      for (const id of threadIds) {
        if (comment.threadId === id) {
          return id
        }
      }
    })
    const threadArray = groupByThread(Object.values(this.props.comments))
    return (
      <div className={css('comment-container')} id="comment-container">
        {
          R.map(
            ([id, comments]) => <Thread key={id} comments={comments} id={id} />,
            R.toPairs(threadArray)
          )
        }
      </div>
    )
  }

  render() {
    return (
      <div className={css('panel-container', 'comment-panel', { hidden: this.state.isHidden })}>
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
          { this.threadContainer() }
          <SubmitField
            value={this.state.value}
            onSubmit={this.handleSubmit}
            onChange={this.handleChange}
          />
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(CommentPanel)
