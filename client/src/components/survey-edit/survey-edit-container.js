import React from 'react'
import * as R from 'ramda'

import SurveyEditCard from './survey-edit-card'

const questions = [
  {
    id: 'yes',
    text: 'This is a demo of my app, please pay attention. The description also happens to be kinda long.',
    type: 'info',
    answers: [],
  },
  {
    id: 'abcd',
    text: 'What do you think of this view?',
    type: 'text',
    answers: [
      { id: '1', text: 'It is pretty alright I guess', name: 'Someone' },
      { id: '2', text: 'Could be better', name: null },
      { id: '3', text: 'Come on I like it', name: 'Person' },
    ],
  },
  {
    id: '1234',
    text: 'Is this button good?',
    type: 'binary',
    answers: [
      { id: '1', option: 0 },
      { id: '2', option: 1 },
      { id: '3', option: 0 },
      { id: '4', option: 0 },
    ],
  },
]

export default class SurveyEditContainer extends React.Component {

  constructor(props) {
    super(props)

    this.openCard = this.openCard.bind(this)

    this.state = { openId: null }
  }

  openCard(id) {
    this.setState({ openId: id })
  }

  render() {
    const { openId } = this.state
    const openQuestion = openId ? questions.find(question => question.id === openId) : null

    return (
      <>{
        openQuestion ? (
          <SurveyEditCard key={openQuestion.id} question={openQuestion} onOpen={this.openCard} />
        ) : (
          questions.map(question => (
            <SurveyEditCard key={question.id} question={question} onOpen={this.openCard} />
          ))
        )
      }</>
    )
  }
}

