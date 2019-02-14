import React from 'react'

function InvalidContainer({ match }) {
  const { name } = match.params
  return (
    <h2>Feedback instance doesn&apos;t exist: {name}</h2>
  )
}

export default InvalidContainer
