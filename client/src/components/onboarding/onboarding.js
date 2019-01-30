import React from 'react'
import { connect } from 'react-redux'
import ReactModal from 'react-modal'
// Helpers
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import * as R from 'ramda'
import { introDone } from '../../actions'
import { shadowModalRoot, shadowDocument } from '../../shadowDomHelper'
// Styles
import styles from './onboarding.scss'
// Assets
import CloseIcon from '../../assets/svg/baseline-close-24px.svg'
import ArrowIcon from '../../assets/svg/baseline-arrow_back_ios-24px.svg'

const css = classNames.bind(styles)
const final = 6

const mapStateToProps = (state) => {
  const persist = state.persist || {}
  return ({
    onboarding: !R.isEmpty(persist.users) && !persist.introDone,
  })
}

const togglePulseAnimation = (step) => {
  shadowDocument().querySelector(`[data-introduction-step="${step}"]`)
    .toggleAttribute('animation-pulse')
}

const clickElement = (step) => {
  shadowDocument().querySelector(`[data-introduction-step-close="${step}"]`)
    .click()
}

class Onboarding extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      step: 1,
    }

    this.handleNextClick = this.handleNextClick.bind(this)
    this.handlePreviousClick = this.handlePreviousClick.bind(this)
  }

  step() {
    if (this.state.step === 1) {
      return (
        <div>
          <h2>Hello!</h2>
          <p>
            Welcome to use the Feedbacker Forum app.
            This tutorial will guide you through the basic functions of the app.
          </p>
        </div>
      )
    } else if (this.state.step === 2) {
      // Start pulse animation
      togglePulseAnimation(this.state.step)
      return (
        <div>
          <h2>Survey Panel</h2>
          <p>This button opens the survey panel.</p>
        </div>
      )
    } else if (this.state.step === 3) {
      // Remove last animation
      togglePulseAnimation(this.state.step - 1)
      return (
        <div>
          <h2>Survey Panel</h2>
          <p>This is the survey panel.</p>
        </div>
      )
    } else if (this.state.step === 4) {
      return (
        <div>
          <h2>Commenting</h2>
          <p>You can leave free form comments and view other people&#39;s comments here.</p>
        </div>
      )
    } else if (this.state.step === 5) {
      return (
        <div>
          <h2>Commenting</h2>
          <p>You can tag and comment on a specific element by clicking this button.</p>
        </div>
      )
    } else if (this.state.step === 6) {
      return (
        <div>
          <h2>Done</h2>
          <p>Now you&#39;re ready to start giving feedback!</p>
        </div>
      )
    }
  }

  handleNextClick() {
    this.setState(state => ({
      step: R.min(final, state.step + 1),
    }))
  }

  handlePreviousClick() {
    this.setState(state => ({
      step: R.max(1, state.step - 1),
    }))
  }

  render() {
    const { step } = this.state
    return (
      <ReactModal
        className={css('intro-modal')}
        isOpen={this.props.onboarding}
        parentSelector={shadowModalRoot}
        overlayClassName={step === 1 ? css('overlay', 'first') : css('overlay')}
      >
        <div className={css('modal-header')}>
          <button
            type="button"
            className={css('close-button')}
            onClick={() => this.props.dispatch(introDone())}
          >
            <InlineSVG src={CloseIcon} />
          </button>
        </div>
        <div className={css('modal-content')}>
          { this.step() }
        </div>
        <div className={css('step-buttons')}>
          <button
            type="button"
            className={step === 1 ? css('previous-button', 'hidden') : css('previous-button')}
            onClick={this.handlePreviousClick}
          >
            <InlineSVG src={ArrowIcon} />
          </button>
          <button
            type="button"
            className={step === final ? css('next-button', 'hidden') : css('next-button')}
            onClick={this.handleNextClick}
          >
            <InlineSVG src={ArrowIcon} />
          </button>
        </div>
        <button
          type="button"
          className={step !== final ? css('hidden') : css('done-button')}
          onClick={() => this.props.dispatch(introDone())}
        >Close tutorial
        </button>
        <button
          type="button"
          onClick={() => this.props.dispatch(introDone())}
          className={step === final ? css('skip-button', 'hidden') : css('skip-button')}
        >skip
        </button>
      </ReactModal>
    )
  }
}
export default connect(mapStateToProps)(Onboarding)
