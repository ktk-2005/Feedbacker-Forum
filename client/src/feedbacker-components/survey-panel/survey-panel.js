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

// eslint-disable-next-line react/prefer-stateless-function
class SurveyPanel extends React.Component {
  render() {
    const { hidden, onClick, role } = this.props

    // TODO: make survey decision on dev type or not, size depends on dev or not
    return (
      <div className={css('panel-container', { hidden })}>
        <Draggable
          defaultPosition={{ x: 10, y: 10 }}
          position={null}
          handle="[data-dragarea]"
        >
          <div
            className={css('panel', 'survey-panel')}
            data-introduction-step="3"
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
