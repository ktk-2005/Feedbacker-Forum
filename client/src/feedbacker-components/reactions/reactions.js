import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import apiCall from '../../api-call'
import { loadComments } from '../../actions'
// Styles
import styles from './reactions.scss'

const css = classNames.bind(styles)

const mapStateToProps = (state) => {
  const users = (state.persist || {}).users || {}
  return { users }
}

class Reactions extends Component {
  handleClick(emoji) {
    const { users, reactions } = this.props
    const toggled = reactions.some(r => r.emoji === emoji && users[r.userId])

    if (toggled) {
      this.deleteReaction(emoji)
    } else {
      this.postReaction(emoji)
    }
  }

  reactionButton(emoji) {
    const { users, reactions } = this.props
    let count = 0
    let toggled = false
    for (const reaction of reactions) {
      if (reaction.emoji === emoji) {
        if (users.hasOwnProperty(reaction.userId)) toggled = true
        count += 1
      }
    }

    // Change up to lit when enough of positive feedback
    let cssEmojiClass = emoji
    if (emoji === 'up' && count >= 3) cssEmojiClass = 'fire'

    return (
      <button
        type="button"
        key={emoji}
        className={css('reaction', toggled ? 'toggled' : '')}
        onClick={() => this.handleClick(emoji)}
      >
        <div className={css('emoji', cssEmojiClass)} />
        <div className={css('counter')} data-count={count}>{count}</div>
      </button>
    )
  }

  async postReaction(emoji) {
    const { commentId } = this.props
    await apiCall('POST', '/reactions', { emoji, commentId })

    const comments = await apiCall('GET', '/comments')
    this.props.dispatch(loadComments(comments))
  }

  async deleteReaction(emoji) {
    const { commentId } = this.props
    await apiCall('DELETE', '/reactions', { emoji, commentId })

    const comments = await apiCall('GET', '/comments')
    this.props.dispatch(loadComments(comments))
  }

  render() {
    const reactionTypes = ['up', 'down', 'party', 'lightbulb']
    return (
      <div className={css('reactions')}>
        {reactionTypes.map(reaction => this.reactionButton(reaction))}
      </div>
    )
  }
}

export default connect(mapStateToProps)(Reactions)
