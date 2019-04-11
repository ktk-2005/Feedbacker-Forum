import React from 'react'
// Helpers
import classNames from 'classnames/bind'
import InlineSVG from 'svg-inline-react'
import * as DomTagging from '../../dom-tagging'
// Assets
import TargetIcon from '../../assets/svg/baseline-location_searching-24px.svg'
// Styles
import styles from './tag-element-button.scss'

const css = classNames.bind(styles)

class TagElementButton extends React.Component {
  /*
  constructor(props) {
    super(props)
    // TODO: Breaks react event handlers
    DomTagging.hijackEventListeners()
  }

  componentDidMount() {
    // TODO: Works but unnecessary if events are not logged (hijacked)
    DomTagging.startObservingDomChange()
  }
  */

  componentWillMount() {
    const { elementTagged, toggleTagElementState } = this.props

    DomTagging.setElementTaggedCallback(event => elementTagged(event))
    DomTagging.setToggleTagElementStateCallback(() => toggleTagElementState())
  }

  componentWillUnmount() {
    DomTagging.setElementTaggedCallback(null)
    DomTagging.setToggleTagElementStateCallback(null)
  }

  render() {
    const { active, selected, elementTagged, toggleTagElementState } = this.props

    return (
      <button
        type="button"
        className={css('button', { active, selected })}
        onClick={() => {
          DomTagging.setElementTaggedCallback(event => elementTagged(event))
          DomTagging.setToggleTagElementStateCallback(() => toggleTagElementState())
          DomTagging.toggleMarkingMode()
        }}
        data-disable-tagging-hide="true"
        data-tooltip="Tag element button"
        data-tooltip-width="150px"
        data-introduction-step="6"
      >
        {active ? 'Cancel' : <InlineSVG src={TargetIcon} raw />}
      </button>
    )
  }
}

export default TagElementButton
