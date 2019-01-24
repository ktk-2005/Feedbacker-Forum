import React from 'react'
import { SortableElement, SortableHandle } from 'react-sortable-hoc'

const Handle = SortableHandle(() => (
  <span style={{
    MozUserSelect: 'none',
    cursor: 'move',
  }}>Drag me</span>
))

function SurveyCreateQuestion({
  question,
  edited,
  onSelect,
  onDeselect,
  onEdit,
}) {
  const { text } = question

  const updateText = (event) => onEdit({ text: event.target.value })

  return (<div>
    <Handle />
    {edited ? (
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
  }</div>)
}

export default SortableElement(SurveyCreateQuestion)

