import React from 'react'

// Helpers
import classNames from 'classnames/bind'
import * as DomTagging from '../../dom-tagging'
import { keyPressSubmit } from '../../globals'
// Components
import TagElementButton from '../tag-element-button/tag-element-button'
// Styles
import submitFieldStyles from './submit-field.scss'

const css = classNames.bind(submitFieldStyles)

class SubmitField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      taggingModeActive: false,
      taggedElementXPath: '',
    }
    this.handleChange = this.handleChange.bind(this)
    this.passSubmit = this.passSubmit.bind(this)
    this.toggleTagElementState = this.toggleTagElementState.bind(this)
    this.handleElementTagged = this.handleElementTagged.bind(this)
    this.unsetTaggedElement = this.unsetTaggedElement.bind(this)
  }

  handleChange(event) {
    this.setState({ value: event.target.value })
  }

  passSubmit(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    this.setState({
      value: '',
      taggedElementXPath: '',
    })

    this.props.handleSubmit(event,
      this.state.taggedElementXPath,
      this.state.value,
      this.props.threadId)
  }

  toggleTagElementState() {
    this.setState(prevState => ({ taggingModeActive: !prevState.taggingModeActive }))
    this.props.toggleTagElementState()
  }

  handleElementTagged(event) {
    const xPath = DomTagging.getXPathByElement(event)
    this.setState({
      taggedElementXPath: xPath,
    })
  }

  unsetTaggedElement() {
    this.setState({
      taggedElementXPath: '',
    })
  }

  render() {
    const { value, taggingModeActive, taggedElementXPath } = this.state
    return (
      <form className={css('comment-form')} onSubmit={this.passSubmit}>
        <textarea
          value={value}
          onChange={this.handleChange}
          placeholder={this.props.threadId ? 'Reply to thread...' : 'Write comment...'}
          ref={this.props.inputRef}
          onKeyDown={keyPressSubmit}
        />
        <div className={css('button-container')}>
          <TagElementButton
            active={taggingModeActive}
            elementTagged={this.handleElementTagged}
            toggleTagElementState={this.toggleTagElementState}
            selected={taggedElementXPath !== ''}
            data-introduction-step="6"
          />
          <input className={css('submit-comment')} type="submit" value="Comment" />
        </div>
      </form>
    )
  }
}

export default SubmitField
