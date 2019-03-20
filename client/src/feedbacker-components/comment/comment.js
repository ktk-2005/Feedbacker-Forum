import React from 'react'
// Helpers
import Moment from 'react-moment'
import moment from 'moment'
import * as R from 'ramda'
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import * as DomTagging from '../../dom-tagging'
import { isMobileViewport } from '../../globals'

// Components
import Reactions from '../reactions/reactions'
import CommentLabel from '../comment-label/comment-label'
// Styles
import styles from './comment.scss'
// Assets
import TargetIcon from '../../assets/svg/baseline-location_searching-24px.svg'

const css = classNames.bind(styles)

class Comment extends React.Component {
  constructor(props) {
    super(props)

    this.handleToggleHighlight = this.handleToggleHighlight.bind(this)
    this.targetElement = this.targetElement.bind(this)
    this.opLabel = this.opLabel.bind(this)
    this.devLabel = this.devLabel.bind(this)
  }

  handleToggleHighlight(xPath, hidePanel) {
    if (isMobileViewport()) {
      hidePanel()
    }
    const element = DomTagging.getElementByXPath(xPath)
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
    DomTagging.toggleHighlightElement(element, false, this.props.id)

    if (this.props.highlighted) {
      this.props.updateTagButtonStatus('')
    } else {
      this.props.updateTagButtonStatus(this.props.id)
    }
  }

  targetElement(comment, hidePanel) {
    const xPath = R.path(['blob', 'xPath'], comment)
    const { highlighted } = this.props
    if (xPath) {
      return (
        <button
          type="button"
          className={css('target-icon', { highlighted })}
          onClick={() => this.handleToggleHighlight(xPath, hidePanel)}
        >
          <InlineSVG src={TargetIcon} raw />
        </button>
      )
    }
  }

  opLabel(op, userId) {
    if (userId === op) {
      return <CommentLabel posterRole="op" />
    }
    return null
  }

  // TODO: refactor
  devLabel(blob) {
    if (blob.dev) {
      return <CommentLabel posterRole="Developer" />
    }
    return null
  }

  render() {
    const { id,
      comment,
      role,
      op,
      onClick,
      buttonText,
      canDelete,
      deleteComment,
      hidePanel,
    } = this.props
    return (
      <div className={css('comment', { dev: role === 'dev' })} key={id}>
        <div className={css('header')}>
          <div className={css('name-label-container')}>
            {this.devLabel(comment.blob)}
            <div className={css('name')}>
              {comment.hideName ? 'Anonymous user' : (comment.username || 'Anonymous user')}
            </div>
            {this.opLabel(op, comment.userId)}
          </div>
          <div className={css('time-target-container')}>
            <Moment
              className={css('timestamp')}
              date={comment.time}
              format="D.MM.YYYY HH.mm"
              data-tooltip={moment(comment.time).fromNow()}
              data-tooltip-south
              data-tooltip-width="100px"
            />
            <div
              data-tooltip="This comment has a element tagged with it"
              data-tooltip-west
              data-tooltip-width="200px"
            >
              {this.targetElement(comment, hidePanel)}
            </div>
          </div>
        </div>
        <div className={css('body')}>
          <div className={css('text')}>
            {comment.text}
          </div>
        </div>

        <Reactions reactions={comment.reactions} commentId={id} />
        <div className={css('actions-container')}>
          {
            canDelete ? (
              <button
                className={css('delete-button')}
                type="button"
                onClick={() => deleteComment(comment)}
              >
                Delete
              </button>
            ) : null
          }
          <button type="button" onClick={onClick}>{buttonText}</button>
        </div>
      </div>
    )
  }
}

export default Comment
