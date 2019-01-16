import React from 'react'
import classNames from 'classnames/bind'
import * as DomTagging from '../../dom-tagging'
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

  render() {
    const { active } = this.props

    return (
      <button
        type="button"
        className={active ? css('button', 'active') : css('button')}
        onClick={DomTagging.toggleMarkingMode}
      >
        {active ? 'Cancel' : 'Tag'}
      </button>
    )
  }
}

export default TagElementButton

