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

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      panelIsHidden: true,
      buttonIsHidden: false,
    }
  }

  handleClick() {
    this.setState(state => ({
      buttonIsHidden: !state.buttonIsHidden,
      panelIsHidden: !state.panelIsHidden,
    }))
  }

  render() {
    const { buttonIsHidden, panelIsHidden } = this.state

    return (
      <div>
        <Button
          hidden={buttonIsHidden}
          onClick={this.handleClick}
        />
        <FloatingPanel
          hidden={panelIsHidden}
          onClick={this.handleClick}
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
