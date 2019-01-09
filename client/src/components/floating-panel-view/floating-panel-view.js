import React from 'react'
import Draggable from 'react-draggable'
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import styles from './floating-panel-view.scss'
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'

const css = classNames.bind(styles)

class FloatingPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {comment: ''}

    this.handleChange = this.handleChange.bind(this)
    this.handleSumbit = this.handleSubmit.bind(this)
  }

  handleChange(e) {
    this.setState({comment: e.target.value})
  }

  handleSubmit(e) {
    alert('jee' + this.state.comment)
    e.preventDefault()
  }

  render() {
    const { hidden, onClick } = this.props

    return (
      <div className={hidden ? css('panel-container', 'hidden') : css('panel-container')}>
        <Draggable
          defaultPosition={{ x: 10, y: 10 }}
          position={null}
          handle="[data-dragarea]"
        >
          <div className={css('panel')}>
            <div
              data-dragarea="true"
              className={css('panel-header')}
            >
              <button
                type="button"
                className={css('close-button')}
                onClick={onClick}
              >
                <InlineSVG src={CloseIcon} />
              </button>
            </div>
            <form onSubmit={this.handleSubmit}>
              <textarea value={this.state.comment} onChange={this.handleChange} />
              <input type="submit" value="Comment" />
            </form>
          </div>
        </Draggable>
      </div>
    )
  }
}

export default FloatingPanel
