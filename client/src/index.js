import React from 'react'
import ReactDOM from 'react-dom'

class VersionInfo extends React.Component {
  constructor() {
    super()
    this.state = { versionString: '...' }
  }

  async componentDidMount() {
    const response = await fetch('/api/version')
    const version = await response.json()
    const shortHash = version.gitHash.substring(0, 8)
    const versionString = `${shortHash} (${version.gitBranch})`
    this.setState({ versionString })
  }

  render() {
    const { versionString } = this.state
    return (
      <div>Version: {versionString}</div>
    )
  }
}

ReactDOM.render(
  <VersionInfo />,
  document.getElementById('root')
)

