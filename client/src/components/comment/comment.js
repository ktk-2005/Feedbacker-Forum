import React from 'react'
// Helpers
import * as R from 'ramda'
import classNames from 'classnames/bind'
import InlineSVG from 'svg-inline-react'
import Moment from 'react-moment'
import moment from 'moment-timezone'
import * as DomTagging from '../../dom-tagging'
// Components
import Reactions from '../reactions/reactions'
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

const Comment = ({ id, comment }) => (
  <div className={css('comment')} key={id}>
    <div className={css('header')}>
      <div className={css('name')}>{comment.username || 'Anonymous user'}</div>
      <Moment
        className={css('timestamp')}
        date={comment.time}
        format="D.MM.YYYY HH:mm"
        tz={moment.tz.guess()}
      />
      { targetElement(comment) }
    </div>
    <div className={css('body')}>
      <div className={css('text')}>
        {comment.text}
      </div>
    </div>
    <Reactions reactions={comment.reactions} commentId={id} />
  </div>
)

export default Comment
