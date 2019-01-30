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
  onDelete,
  onEdit,
  deleted,
  disabledImp: disabled,
}) {
  const { text } = question

  const updateText = (event) => onEdit({ text: event.target.value })

  return (<div>
    <Handle />
    {edited ? (
    <>
      <button disabled={disabled} key="deselect" onClick={onDeselect}>Done</button>
      <button disabled={disabled} key="delete" onClick={onDelete}>Delete</button>
      <input disabled={deleted} type="text" autoFocus onChange={updateText} value={text} />
    </>
  ) : (
    <>
      <button disabled={disabled} key="select" onClick={onSelect}>Edit</button>
      <span>{text}</span>
    </>
  )
  }</div>)
}

export default SortableElement(SurveyCreateQuestion)

