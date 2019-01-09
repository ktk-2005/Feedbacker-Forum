import React, { Component } from 'react'

// thumbs-up   unicode: U+1F44D -> &#x1f44d;
// thumbs-down unicode: U+1F44E -> &#x1f44e;
// fire        unicode: U+1F525 -> &#x1f525;

class Reactions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      reactionCounts: {}
    }
  }

  async componentDidMount() {
    let reactions = await fetch(`/api/reactions/${comment_id}`)
    reactions = await reactions.json()
    for (reaction in reactions) {
      let incrementedCounts = this.state.reactionCounts
      incrementedCounts[reaction.emoji] = incrementedCounts[reaction.emoji] === undefined ? 1 : incrementedCounts[reaction.emoji] + 1
      this.setState({
        reactionCounts: incrementedCounts
      })
    }
  }

  commentReactions = () => {
    return (
      <div>
        <ul>
          {this.reactionCounts.map(reaction => {
            <li key>{reaction} {this.state.reactionCounts[reaction]}</li>
          })}
        </ul>
      </div>
    )
  }

  reaction = async ({emoji, user, comment_id}) => {

  }

  removeReaction = async ({emoji, user, comment_id}) => {
    let remove = await fetch(`/api/reactions/${comment_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({emoji, user, comment_id})
    })
    return await remove.json()
  }

  render() {
    return (
      <div>
        {commentReactions()}
      </div>
    )
  }
}

export default Reactions
