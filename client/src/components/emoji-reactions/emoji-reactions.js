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
      toggleReactions: {},
    }
  }

  handleClick(emoji, toggled) {
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
    if (this.state.toggleReactions[emoji]) {
      this.deleteReaction(emoji)
      toggle()
    } else {
      this.postReaction(emoji)
      toggle()
    }
  }

  reactionButton(emoji, toggled, counts) {
    return (
      <button key={emoji} className={css('reaction', toggled[emoji] ? 'toggled' : '')} onClick={() => this.handleClick(emoji, toggled)}>
        <div className={css('emoji', emoji)} />
        <div className={css('counter')}>{counts[emoji]}</div>
      </button>
    )
  }

  commentReactions(toggled, counts) {
    return (
      <div className={css('reactions')}>
        {this.state.reactions.map(reaction => this.reactionButton(reaction, toggled, counts))}
      </div>
    )
  }

  async postReaction(emoji) {
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
    const { users, comment_id } = this.props
    const userHash = Object.keys(users)
    if (userHash.length === 0) return 'No user'
    for (const i of userHash) {
      const body = JSON.stringify({ emoji, userId: i, commentId: comment_id })
      await fetch('/api/reactions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })
    }
    fetch('/api/comments')
      .then(x => x.json())
      .then((comments) => {
        this.props.dispatch({ type: 'LOAD_ALL', comments })
      })
  }

  render() {
    const { users, reactions } = this.props
    const toggled = {}
    const incrementedCounts = {}
    for (const reaction of reactions) { // TODO: refactor whole loop and contents
      incrementedCounts[reaction.emoji] = incrementedCounts[reaction.emoji] === undefined ? 1 : incrementedCounts[reaction.emoji] + 1
      toggled[reaction.emoji] = users.hasOwnProperty(reaction.user_id)
    }
    return this.commentReactions(toggled, incrementedCounts)
  }
}

export default connect(mapStateToProps)(Reactions)
