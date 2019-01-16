import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
// Styles
import styles from './emoji-reactions.scss'

const css = classNames.bind(styles)

// thumbs-up   unicode: U+1F44D -> &#x1f44d;
// thumbs-down unicode: U+1F44E -> &#x1f44e;
// fire        unicode: U+1F525 -> &#x1f525;

const mapStateToProps = (state) => {
  // TODO: Check what is this
  const users = (state.persist || {}).users || {}
  return { users }
}

class Reactions extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      reactions: ['up', 'down', 'fire'],
    }
  }

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
      if (reaction.emoji !== emoji) continue
      if (users.hasOwnProperty(reaction.userId)) toggled = true
      count += 1
    }

    return (
      <button
        type="button"
        key={emoji}
        className={css('reaction', toggled ? 'toggled' : '')}
        onClick={() => this.handleClick(emoji)}
      >
        <div className={css('emoji', emoji)} />
        <div className={css('counter')}>{count}</div>
      </button>
    )
  }

  async postReaction(emoji) {
    // eslint-disable-next-line
    const { users, commentId } = this.props
    const userHash = Object.keys(users)
    if (userHash.length === 0) return 'No user'
    const body = JSON.stringify({ emoji, userId: userHash[0], commentId })
    await fetch('/api/reactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
    fetch('/api/comments')
      .then(x => x.json())
      .then((comments) => {
        this.props.dispatch({ type: 'LOAD_ALL', comments })
      })
  }

  async deleteReaction(emoji) {
    // eslint-disable-next-line
    const { users, commentId } = this.props
    const userHash = Object.keys(users)
    if (userHash.length === 0) return 'No user'

    for (const i of userHash) {
      const body = JSON.stringify({ emoji, userId: i, commentId })
      // TODO: break loop if successful deletion
      await fetch('/api/reactions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })
    }

    /*
    await fetch('/api/reactions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emoji, users: userHash, commentId: commentId }),
    })
    */
    fetch('/api/comments')
      .then(x => x.json())
      .then((comments) => {
        this.props.dispatch({ type: 'LOAD_ALL', comments })
      })
  }

  render() {
    return (
      <div className={css('reactions')}>
        {this.state.reactions.map(reaction => this.reactionButton(reaction))}
      </div>
    )
  }
}

export default connect(mapStateToProps)(Reactions)
