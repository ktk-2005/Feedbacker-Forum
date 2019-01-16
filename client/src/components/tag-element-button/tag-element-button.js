import React from 'react'
import classNames from 'classnames/bind'
import * as DomTagging from '../../dom-tagging'
// Styles
import styles from './tag-element-button.scss'

const css = classNames.bind(styles)

class TagElementButton extends React.Component {
  constructor(props) {
    super(props)
    // DomTagging.hijackEventListeners() // TODO:
  }

  componentWillMount() {
    const { elementTagged, toggleTagElementState } = this.props

    DomTagging.setElementTaggedCallback(event => elementTagged(event))
    DomTagging.setToggleTagElementStateCallback(() => toggleTagElementState())
  }

  componentDidMount() {
    DomTagging.startObservingDomChange()
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

