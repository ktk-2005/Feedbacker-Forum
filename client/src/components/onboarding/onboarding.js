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
const final = 7

const mapStateToProps = (state) => {
  const persist = state.persist || {}
  return ({
    onboarding: !R.isEmpty(persist.users) && !persist.introDone,
  })
}

const setPulseAnimation = (step) => {
  const el = shadowDocument().querySelector(`[data-introduction-step="${step}"]`)

  if (el) el.setAttribute('animation-pulse', 'true')
}

const stopPulseAnimation = (step) => {
  const el = shadowDocument().querySelector(`[data-introduction-step="${step}"]`)

  if (el) el.removeAttribute('animation-pulse')
}

const clickElementClose = (step) => {
  shadowDocument().querySelector(`[data-introduction-step-close="${step}"]`)
    .click()
}

const clickElementOpen = (step) => {
  shadowDocument().querySelector(`[data-introduction-step="${step}"]`)
    .click()
}

const makeContent = (header, paragraph) => (
    <>
      <h3>{header}</h3>
      <p>{paragraph}</p>
    </>
)

class Onboarding extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      step: 1,
      prev: 1,
    }

    this.handleNextClick = this.handleNextClick.bind(this)
    this.handlePreviousClick = this.handlePreviousClick.bind(this)
    this.handleCloseIntro = this.handleCloseIntro.bind(this)
    this.doStepActions = this.doStepActions.bind(this)
  }

  step() {
    const { step } = this.state

    if (step === 1) {
      return (
        makeContent(
          'Welcome!',
          'Welcome to use the Feedbacker Forum app.This tutorial will guide you through the basic functions of the app.'
        )
      )
    } else if (step === 2) {
      return (
        makeContent(
          'Survey Panel',
          'This button opens the survey panel.'
        )
      )
    } else if (step === 3) {
      return (
        makeContent(
          'Survey Panel',
          'This is the survey panel where you can aswer questions.'
        )
      )
    } else if (step === 4) {
      return (
        makeContent(
          'Commenting',
          'This button opens the commenting panel.'
        )
      )
    } else if (step === 5) {
      return (
        makeContent(
          'Commenting',
          'You can leave free form comments and view other people\'s comments here.'
        )
      )
    } else if (step === 6) {
      return (
        makeContent(
          'Tagging elements',
          'You can tag and comment on a specific element by clicking this button.'
        )
      )
    } else if (step === 7) {
      return (
        makeContent(
          'Done',
          'Now you\'re ready to start giving feedback!'
        )
      )
    }
  }

  doStepActions() {
    const { step, prev } = this.state
    if (step === 1) {
      stopPulseAnimation(step + 1)
    } else if (step === 2) {
      setPulseAnimation(step)
      if (prev > step) clickElementClose(prev)
    } else if (step === 3) {
      clickElementOpen(step - 1)
      stopPulseAnimation(prev)
    } else if (step === 4) {
      setPulseAnimation(step)
      clickElementClose(prev)
    } else if (step === 5) {
      clickElementOpen(step - 1)
      stopPulseAnimation(prev)
    } else if (step === 6) {
      setPulseAnimation(step)
      if (prev < step) clickElementClose(prev)
    } else if (step === 7) {
      stopPulseAnimation(prev)
    }
  }

  handleNextClick() {
    this.setState(state => ({
      prev: state.step,
      step: R.min(final, state.step + 1),
    }), this.doStepActions)
  }

  handlePreviousClick() {
    this.setState(state => ({
      prev: state.step,
      step: R.max(1, state.step - 1),
    }), this.doStepActions)
  }

  handleCloseIntro() {
    stopPulseAnimation(this.state.step)
    if (this.state.step === 3 || this.state.step === 5) {
      const el = shadowDocument().querySelector(`[data-introduction-step-close="${this.state.step}"]`)
      if (!el.classList.contains('hidden')) clickElementClose(this.state.step)
    }
    this.props.dispatch(introDone())
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
            onClick={this.handleCloseIntro}
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
          onClick={this.handleCloseIntro}
        >Close tutorial
        </button>
        <button
          type="button"
          onClick={this.handleCloseIntro}
          className={step === final ? css('skip-button', 'hidden') : css('skip-button')}
        >skip
        </button>
      </ReactModal>
    )
  }
}
export default connect(mapStateToProps)(Onboarding)
