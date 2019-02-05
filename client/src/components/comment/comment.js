import React from 'react'
import Moment from 'react-moment'
import * as R from 'ramda'
import InlineSVG from 'svg-inline-react'
// Helpers
import classNames from 'classnames/bind'
import * as DomTagging from '../../dom-tagging'
// Components
import Reactions from '../reactions/reactions'
import CommentLabel from '../comment-label/comment-label'
// Styles
import styles from './comment.scss'
// Assets
import TargetIcon from '../../assets/svg/baseline-location_searching-24px.svg'

const css = classNames.bind(styles)

const handleToggleHighlight = (xPath) => {
  const element = DomTagging.getElementByXPath(xPath)
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  })
  DomTagging.toggleHighlightElement(element, true)
}

const targetElement = (comment) => {
  const xPath = R.path(['blob', 'xPath'], comment)
  if (xPath) {
    return (
      <button
        type="button"
        className={css('target-icon')}
        onClick={() => handleToggleHighlight(xPath)}
      >
        <InlineSVG src={TargetIcon} raw />
      </button>
    )
  }
}

const chooseLabel = (op, userId) => {
  if (userId === op) {
    return <CommentLabel posterRole="op" />
  }
  return null
}

const Comment = ({ id, comment, role, op, onClick, buttonText, canDelete, deleteComment }) => (
  <div className={css('comment', { dev: role === 'dev' })} key={id}>
    <div className={css('header')}>
      <div className={css('name')}>Anonymous user</div>
      {chooseLabel(op, comment.userId)}
      <Moment className={css('timestamp')} fromNow>{comment.time}</Moment>
      { targetElement(comment) }
    </div>
    <div className={css('body')}>
      <div className={css('text')}>
        {comment.text}
      </div>
    </div>
    <Reactions reactions={comment.reactions} commentId={id} />
    <div className={css('expand-button-container')}>
      <button className={css('delete-button', { hidden: !canDelete })} type="button" onClick={() => deleteComment(comment)}>Delete</button>
      <button type="button" onClick={onClick}>{buttonText}</button>
    </div>
  </div>
)

export default Comment
