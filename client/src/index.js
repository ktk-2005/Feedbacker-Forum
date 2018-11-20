import React from 'react'
import ReactDOM from 'react-dom'
import Button from './components/open-panel-button'
import FloatingPanel from './components/floating-panel-view/floating-panel-view'

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
        <h1>Feedbacker Forum</h1>
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

ReactDOM.render(
  <MainView />,
  document.getElementById('root')
)
