import React from 'react'
import classNames from 'classnames/bind'
import * as DomTagging from '../../dom-tagging'
// Styles
import styles from './tag-element-button.scss'

const css = classNames.bind(styles)

class TagElementButton extends React.Component {
  componentDidMount() {
  }

  render() {
    const { active, onClick } = this.props

    const onClickOverride = () => {
      onClick()
      DomTagging.toggleMarkingMode()
    }

    return (
      <button
        type="button"
        className={active ? css('button', 'active') : css('button')}
        onClick={onClickOverride}
      >
        <i>Tag</i>
      </button>
    )
  }
}

export default TagElementButton

