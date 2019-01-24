import React from 'react'
import { DragSource } from 'react-dnd'

const dragSource = {
  beginDrag: (props) => ({ question }),
}

const dragCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
})

function SurveyCreateQuestion({
  question,
  edited,
  onSelect,
  onDeselect,
  onEdit,
  connectDragSource,
  isDragging
}) {
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

export default DragSource('SurveyCreateQuestion', dragSource, dragCollect)(SurveyCreateQuestion)

