import React from 'react'
import classNames from 'classnames/bind'

import { shadowDocument } from '../../shadowDomHelper'
import apiCall from '../../api-call'
import styles from './authorization-view.scss'

const css = classNames.bind(styles)

const subdomain = window.location.host.split('.')[0]

class AuthorizationView extends React.Component {
  constructor(props) {
    super(props)
    this.submitAuthTry = this.submitAuthTry.bind(this)
  }

  async componentDidMount() {
    try {
      const { authToken } = await apiCall('POST', '/authorization/retry', { subdomain }, {
        noToast: true,
      })
      this.setupAuthCookie(authToken)
    } catch (err) {
      console.info('User is not authenticated previously', err)
    }
  }

  setupAuthCookie(authToken) {
    document.cookie = `FeedbackProxyAuth=${authToken};path=/;max-age=315360000`
    window.location.reload()
  }

  async submitAuthTry(event) {
    event.preventDefault()

    const password = shadowDocument().getElementById('password').value
    const { authToken } = await apiCall('POST', '/authorization', { password, subdomain })
    this.setupAuthCookie(authToken)
  }

  render() {
    return (
      <div className={css('center-center-block')}>
        <div className={css('login-view')}>
          <h1>Authorization</h1>
          <p>
            This instance <code>{subdomain}</code> is protected.
            You can access it with the passphrase provided by the author of this
            instance (this is most likely the person who shared the link with you).
          </p>
          <form className={css('form')}>
            <input
              type="password"
              placeholder="passphrase"
              id="password"
              className={css('input')}
            />
            <input
              type="submit"
              onClick={this.submitAuthTry}
              className={css('submit-button')}
            />
          </form>
        </div>
      </div>
    )
  }
}

export default AuthorizationView
