import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames/bind'
import Button from './components/open-panel-button/open-panel-button'
import FloatingPanel from './components/floating-panel-view/floating-panel-view'

import styles from './scss/_base.scss'

const css = classNames.bind(styles)

class MainView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      panelIsHidden: true,
      buttonIsHidden: false,
    }
  }

  handleClick() {
    this.setState({
      buttonIsHidden: !this.state.buttonIsHidden,
      panelIsHidden: !this.state.panelIsHidden,
    })
  }

  render() {
    return (
      <div className="test">
        <h1>Feedbacker Forum</h1>
        <Button
          hidden={this.state.buttonIsHidden}
          onClick={this.handleClick.bind(this)}
        />
        <FloatingPanel
          hidden={this.state.panelIsHidden}
          onClick={this.handleClick.bind(this)}
        />
      </div>
    )
  }
}

ReactDOM.render(
  <div className={css('feedback-app-main-container')}>
    <MainView />
  </div>,
  document.getElementById('root')
)
