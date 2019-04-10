import React from 'react'
import ReactDOM from 'react-dom'

const subdomain = window.location.host.split('.')[0]

function InvalidContainer() {
  return (
    <h2>Feedback instance doesn&apos;t exist: {subdomain}</h2>
  )
}

const root = document.getElementById('root')

ReactDOM.render(
  <InvalidContainer />,
  root
)
