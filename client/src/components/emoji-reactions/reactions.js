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
  const users = (state.persist || {}).users || {}
  return { users }
}

class Reactions extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      reactions: ['up', 'down', 'fire'],
      // toggleReactions: {},
    }
  }

  handleClick(emoji, toggled) {
    /*
    if (this.state.toggleReactions === {}) {
      this.setState({ toggleReactions: toggled })
    }
    const toggle = () => {
      const newToggled = this.state.toggleReactions
      newToggled[emoji] = !newToggled[emoji]
      this.setState(state => ({
        ...state,
        toggleReactions: newToggled,
      }))
    }
    */

    console.log('CLICK', toggled)
    if (toggled[emoji]) {
      this.deleteReaction(emoji)
      // toggle()
    } else {
      this.postReaction(emoji)
      // toggle()
    }
  }

  reactionButton(emoji, toggled, counts) {
    if (this.props.comment_id == '0a8fbb57')
    console.log('BUTTON', toggled)

    const handleClick = (toggled => () => this.handleClick(emoji, toggled))(toggled)

    return (
      <button
        type="button"
        key={emoji}
        className={css('reaction', toggled[emoji] ? 'toggled' : '')}
        onClick={handleClick}
      >
        <div className={css('emoji', emoji)} />
        <div className={css('counter')}>{counts[emoji]}</div>
      </button>
    )
  }

  commentReactions(toggled, counts) {
    if (this.props.comment_id == '0a8fbb57')
    console.log('RENDER', toggled)
    return (
      <div className={css('reactions')}>
        {this.state.reactions.map(reaction => this.reactionButton(reaction, toggled, counts))}
      </div>
    )
  }

  async postReaction(emoji) {
    // eslint-disable-next-line
    const { users, comment_id } = this.props
    const userHash = Object.keys(users)
    if (userHash.length === 0) return 'No user'
    const body = JSON.stringify({ emoji, userId: userHash[0], commentId: comment_id })
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
    const { users, comment_id } = this.props
    const userHash = Object.keys(users)
    if (userHash.length === 0) return 'No user'

    for (const i of userHash) {
      const body = JSON.stringify({ emoji, userId: i, commentId: comment_id })
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
      body: JSON.stringify({ emoji, users: userHash, commentId: comment_id }),
    })
    */
    fetch('/api/comments')
      .then(x => x.json())
      .then((comments) => {
        this.props.dispatch({ type: 'LOAD_ALL', comments })
      })
  }

  render() {
    window.TOGGLED_SERIAL = (window.TOGGLED_SERIAL || 0) + 1

    const { users, reactions } = this.props
    const toggled = {serial: window.TOGGLED_SERIAL}
    const incrementedCounts = {}
    for (const reaction of reactions) { // TODO: refactor whole loop and contents
      incrementedCounts[reaction.emoji] = incrementedCounts[reaction.emoji] === undefined
        ? 1
        : incrementedCounts[reaction.emoji] + 1
      if (users.hasOwnProperty(reaction.user_id)) {
        toggled[reaction.emoji] = true
      }
    }
    return this.commentReactions(toggled, incrementedCounts)
  }
}

export default connect(mapStateToProps)(Reactions)
