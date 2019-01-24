import React from 'react'

function SurveyCreateQuestion({ question, edited, onSelect, onDeselect, onEdit }) {
  const { text } = question

  const updateText = (event) => onEdit({ text: event.target.value })

  return <div>{
    edited ? (
    <>
      <button key="deselect" onClick={onDeselect}>Done</button>
      <input type="text" autoFocus onChange={updateText} value={text} />
    </>
  ) : (
    <>
      <button key="select" onClick={onSelect}>Edit</button>
      <span>{text}</span>
    </>
  )
  }</div>
}

export default SurveyCreateQuestion

