import React from 'react'
import Draggable from 'react-draggable'
import { connect } from 'react-redux'
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import styles from './survey-panel.scss'
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'
import Survey from '../survey/survey'
import SurveyEditContainer from '../survey-edit/survey-edit-container'

const css = classNames.bind(styles)

const mapStateToProps = state => ({ role: state.role })

// Padding on the right and bottom side of the window
const windowPadPx = 10

// eslint-disable-next-line react/prefer-stateless-function
class SurveyPanel extends React.Component {
  constructor(props) {
    super(props)

    this.panelRef = React.createRef()
    this.state = {
      panelWidth: 0,
      panelHeight: 0,
      windowWidth: window.innerWidth - windowPadPx,
      windowHeight: window.innerHeight - windowPadPx,
      forcePosition: null,
    }

    this.windowResized = this.windowResized.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.windowResized)
    this.windowResized()

    this.domUpdated()
  }

  componentDidUpdate() {
    this.domUpdated()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResized)
  }

  windowResized() {
    this.setState({
      windowWidth: window.innerWidth - windowPadPx,
      windowHeight: window.innerHeight - windowPadPx,
    })
  }

  domUpdated() {
    const panel = this.panelRef.current
    const { clientWidth, clientHeight } = panel
    const { panelWidth, panelHeight, windowWidth, windowHeight } = this.state

    // Update panel size from DOM to state.
    if (Math.abs(clientWidth - panelWidth) > 10 || Math.abs(clientHeight - panelHeight) > 10) {
      this.setState({
        panelWidth: clientWidth,
        panelHeight: clientHeight,
      })
    }

    // If the panel is outside of the viewport force it inside.
    const { left, top, right, bottom } = panel.getBoundingClientRect()
    const clipX = right >= windowWidth + windowPadPx
    const clipY = bottom >= windowHeight + windowPadPx
    if (clipX || clipY) {
      this.setState({
        forcePosition: {
          x: clipX ? Math.max(windowWidth - panelWidth, 0) : left,
          y: clipY ? Math.max(windowHeight - panelHeight, 0) : top,
        },
      })
    }

    // Force position is only strobed for a single render, let Draggable handle
    // the position in the general case.
    if (this.state.forcePosition) {
      this.setState({ forcePosition: null })
    }
  }

  render() {
    const { hidden, onClick, role } = this.props
    const { panelWidth, panelHeight, windowWidth, windowHeight, forcePosition } = this.state

    const defaultPosition = { x: 10, y: 10 }
    const bounds = {
      left: 0,
      top: 0,
      right: windowWidth - panelWidth,
      bottom: windowHeight - panelHeight,
    }

    // TODO: make survey decision on dev type or not, size depends on dev or not
    return (
      <div className={css('panel-container', { hidden })}>
        <Draggable
          defaultPosition={defaultPosition}
          position={forcePosition}
          bounds={bounds}
          handle="[data-dragarea]"
        >
          <div
            className={css('panel', 'survey-panel')}
            data-introduction-step="3"
            ref={this.panelRef}
          >
            <div
              data-dragarea="true"
              className={css('panel-header')}
            >
              <h5 className={css('heading')}>Survey Panel</h5>
              <button
                type="button"
                className={css('close-button')}
                onClick={onClick}
                data-introduction-step-close="3"
              >
                <InlineSVG src={CloseIcon} />
              </button>
            </div>
            {role === 'dev' ? (
              <div className={css('panel-body', 'edit-container')}>
                <SurveyEditContainer open={!hidden} />
              </div>
            ) : (
              <div className={css('panel-body')}>
                <Survey />
              </div>
            )}
          </div>
        </Draggable>
      </div>
    )
  }
}

export default connect(mapStateToProps)(SurveyPanel)
