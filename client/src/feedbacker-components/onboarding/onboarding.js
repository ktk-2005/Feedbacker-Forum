import React from 'react'
import { connect } from 'react-redux'
import ReactModal from 'react-modal'
// Helpers
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import * as R from 'ramda'
import { introCompleted } from '../../actions'
import { shadowModalRoot, shadowDocument } from '../../shadowDomHelper'
import { showCookieToast } from '../../globals'
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
    onboarding: persist.users && !R.isEmpty(persist.users) && !persist.introCompleted,
    dev: persist.users && !R.isEmpty(persist.users) && state.role === 'dev',
    acceptCookies: persist.acceptCookies,
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
    this.modalClosed = this.modalClosed.bind(this)
    this.keyTraverse = this.keyTraverse.bind(this)
    this.makeContent = this.makeContent.bind(this)
  }

  makeContent(header, paragraphs) {
    return (
      <>
        <h3>{header}</h3>
        {
          paragraphs.map(
            (p, index) => (
              <p key={index}>{p}</p>
            )
          )
        }
      </>
    )
  }

  step() {
    const { step } = this.state
    const { dev } = this.props

    if (step === 1) {
      return (
        this.makeContent(
          'Welcome!',
          dev
            ? [
              `
                Welcome to use the Feedbacker Forum app! Our goal is to make giving
                and receiving feedback as easy and painless as possible.
              `,
              `
                With the support of both surveys and free-form commenting, you will
                be able to get different kinds of opinions from those testing your
                live UI.
              `,
              `
                In this tutorial we will guide you through the basic functions
                of the app.
              `,
            ]
            : [
              `
                Welcome to use the Feedbacker Forum app! Our goal is to make giving
                and receiving feedback as easy and painless as possible.
              `,
              `
                With the support of both surveys and free form commenting, you can
                express your opinions in a variety of ways.
              `,
              `
                In this tutorial we will guide you through the basic functions of
                the app.
              `,
            ]
        )
      )
    } else if (step === 2) {
      return (
        this.makeContent(
          'Surveys',
          dev
            ? [
              `
                If you have specific questions you want answers to you can create a
                survey. This can be done in the survey panel which can be opened by
                clicking the button in the lower left corner.
              `,
            ]
            : [`
                If the author (the owner of the instance) has created a survey, you
                can view it in the survey panel which can be opened by
                clicking the button in the lower left button.
            `,
            ]
        )
      )
    } else if (step === 3) {
      return (
        this.makeContent(
          'Surveys',
          dev
            ? [
              `
                This is the survey panel where you can create surveys. You
                can either add regular questions or choice questions where you can
                give two options for the testers to choose from (e.g. yes or no questions).
                You can also add descriptive text to your surveys and change the
                order of the questions.
                Here you can also view the answers you've received.
              `,
            ]
            : [
              `
                This is the survey panel where you can answer the surveys. Surveys can
                contain different types of questions the author wants your answer to.
                You can also edit your answers.
              `,
              `
                Tip: The survey panel is draggable so
                if it's blocking your view you can also move it around instead of closing it.
              `,
            ]
        )
      )
    } else if (step === 4) {
      return (
        this.makeContent(
          'Commenting',
          dev
            ? [
              `
                The testers can also leave free-form comments. This can be
                done in the comment panel which opens by clicking the button in the lower left corner.
              `,
            ]
            : [
              `
                You can also express your opinions by posting free-form comments.
                This can be done in the commenting panel which opens by clicking
                the button in the lower left corner.
              `,
            ]
        )
      )
    } else if (step === 5) {
      return (
        this.makeContent(
          'Commenting',
          dev
            ? [
              `
                Here you can view the comments you've received. You can also participate
                in the conversation and your comments will have a tag that indicates
                that you are the owner the instance. You can also react to other
                people's comments.
              `,
            ]
            : [
              `
                This is the comment panel where you can post the free-form comments.
                You can reply and react to other people's comments and the author can
                also participate in the conversation.
              `,
            ]
        )
      )
    } else if (step === 6) {
      return (
        this.makeContent(
          'Tagging elements',
          [
            `
              To make clear which element you're referring to, you can tag it into
              the comment. This can be done by clicking this tagging button and
              then choosing the element you want to tag.
            `,
            `
              Comments with an element tagged to them have a similar icon in the comment.
              You can view the tagged element by clicking this icon.
            `,
          ]
        )
      )
    } else if (step === 7) {
      return (
        this.makeContent(
          'Done',
          dev
            ? [
              `
                Now you're ready to start receiving feedback on your beautiful creations!
                Have fun!
              `,
            ]
            : [
              `
                Now you're ready to start giving feedback! Have fun!
              `,
            ]
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
      if (prev < step) clickElementOpen(step - 1)
      stopPulseAnimation(prev)
    } else if (step === 6) {
      if (prev > step) clickElementOpen(4)
      setPulseAnimation(step)
    } else if (step === 7) {
      clickElementClose(5)
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
    } else if (this.state.step === 6) {
      const el = shadowDocument().querySelector(`[data-introduction-step-close="${this.state.step - 1}"]`)
      if (!el.classList.contains('hidden')) clickElementClose(this.state.step - 1)
    }
    this.props.dispatch(introCompleted())

    this.modalClosed()
  }

  modalClosed() {
    if (!this.props.acceptCookies) {
      showCookieToast(this.props.dispatch)
    }
  }

  keyTraverse(e) {
    const { step } = this.state
    switch (e.key) {
      case 'ArrowRight': if (step < final) this.handleNextClick()
        break
      case 'ArrowLeft': if (step > 1) this.handlePreviousClick()
        break
      case 'Escape': this.handleCloseIntro()
        break
      default: break
    }
  }

  render() {
    const { step } = this.state
    let element = null
    return (
      <ReactModal
        className={css('intro-modal')}
        isOpen={this.props.onboarding}
        onRequestClose={this.modalClosed}
        parentSelector={shadowModalRoot}
        overlayClassName={step === 1 ? css('overlay', 'first') : css('overlay')}
        onAfterOpen={() => element && element.focus()}
      >
        <div
          className={css('event-modal')}
          ref={(el) => { element = el }}
          tabIndex="-1"
          onKeyDown={this.keyTraverse}
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
          >
            Close tutorial
          </button>
          <div className={css('skip-button-container')}>
            <button
              type="button"
              onClick={this.handleCloseIntro}
              className={step === final ? css('skip-button', 'hidden') : css('skip-button')}
            >skip
            </button>
          </div>
        </div>
      </ReactModal>
    )
  }
}
export default connect(mapStateToProps)(Onboarding)
