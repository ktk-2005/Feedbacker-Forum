import React from 'react'
import ReactDOM from 'react-dom'
import styles from './index.css'
import classNames from 'classnames/bind'

const css = classNames.bind(styles)

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

class MainView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      panelIsVisible: false,
      buttonIsVisible: true,
    }
  }

  handleClick() {
    this.setState({
      buttonIsVisible: !this.state.buttonIsVisible,
      panelIsVisible: !this.state.panelIsVisible,
    })
  }

  render() {
    return(
      <div className="test">
            <Button visible={this.state.buttonIsVisible}
              onClick={this.handleClick.bind(this)}
            />
            <FloatingPanel visible={this.state.panelIsVisible}
              onClick={this.handleClick.bind(this)}
            />
      </div>
    )
  }
}

const Button = ({visible, onClick}) => {
  return (
    <button
      className={visible ? css('button') : css('hidden')}
      onClick={onClick}
    >+</button>
  )
}

const FloatingPanel = ({visible, onClick}) => {
    return (
      <div className={visible ? css('panel') : css('hidden')}>
        <button
          className={css('panelButton')}
          onClick={onClick}
        >x</button>
      </div>
    )
}


ReactDOM.render(
  <MainView />,
  document.getElementById('root')
)
