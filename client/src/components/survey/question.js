import React from 'react'

const Question = ({ question, current, length }) => (
  <div>
    <h1>QUESTION {current}</h1>
    {question.text}
    {length}
  </div>
)

export default Question
