import React from 'react'
import { connect } from 'react-redux'
import ReactModal from 'react-modal'

import classNames from 'classnames/bind'

import { shadowModalRoot } from '../../shadowDomHelper'
import apiCall from '../../api-call'
import { setPersistData } from '../../actions'

import styles from './add-username-modal.scss'

const css = classNames.bind(styles)

const mapStateToProps = (state) => {
  const users = (state.persist || {}).users || {}
  return { users }
}

class UsernameModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    this.setState({ value: event.target.value })
  }

  async handleSubmit(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    const { users } = this.props
    const [id] = Object.keys(users)
    const secret = users[id]
    const name = this.state.value
    await apiCall('PUT', '/users', {
      name,
      id,
      secret,
    })
    this.setState({
      value: '',
    })
    this.props.toggle()
    this.props.dispatch(setPersistData({ users: { [id]: secret, name } }))
  }

  render() {
    return (
      <ReactModal
        className={css('username-modal')}
        isOpen={this.props.isOpen}
        parentSelector={shadowModalRoot}
        overlayClassName={css('username-overlay')}
        onRequestClose={this.props.toggle}
        shouldFocusAfterRender
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
      >
        <form className={css('modal-content')} onSubmit={this.handleSubmit}>
          <input type="text" onChange={this.handleChange} name="name" id="name" placeholder="New username..." />
          <input className={css('add-button')} type="submit" value="Add username" />
        </form>
      </ReactModal>
    )
  }
}

export default connect(mapStateToProps)(UsernameModal)