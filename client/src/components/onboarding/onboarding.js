import React from 'react'
import { connect } from 'react-redux'
// Helpers
import classNames from 'classnames/bind'
import * as R from 'ramda'
import { introDone } from '../../actions'
// Styles
import styles from './onboarding.scss'

const css = classNames.bind(styles)

const mapStateToProps = (state) => {
  const persist = state.persist || {}
  return ({
    onboarding: !R.isEmpty(persist.users) && !persist.introDone
  })
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
      return (<h2>hello</h2>)
    } else if (this.state.step === 2) {
      return (<h2>hello2</h2>)
    } else {
      return (<h2>hello3</h2>)
    }
  }

  handleNextClick() {
    this.setState(state => ({
      step: state.step + 1,
    }))
  }

  handlePreviousClick() {
    this.setState(state => ({
      step: R.max(1, (state.step - 1)),
    }))
    console.log(this.state.step)
  }

  render() {
    return (
      <div className={this.props.onboarding ? css('intro-container') : css('intro-container', 'hidden')}>
        <div className={css('modal')}>
          <button
            type="button"
            onClick={() => this.props.dispatch(introDone())}
            className={css('skip-button')}
          >skip
          </button>
          { this.step() }
          <button
            type="button"
            className={css('previous-button')}
            onClick={this.handlePreviousClick}
          >previous
          </button>
          <button
            type="button"
            className={css('next-button')}
            onClick={this.handleNextClick}
          >next
          </button>
        </div>
      </div>
    )
  }
}
export default connect(mapStateToProps)(Onboarding)
