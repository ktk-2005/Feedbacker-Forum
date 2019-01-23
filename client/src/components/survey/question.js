import React from 'react'

const Question = ({ question, length }) => {
  return (
    <div>
      <h1>QUESTION</h1>
      {question}
      {length}
    </div>
  )
}

export default Question
