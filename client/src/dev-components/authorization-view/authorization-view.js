import React from 'react'
import classNames from 'classnames/bind'

import { shadowDocument } from '../../shadowDomHelper'
import apiCall from '../../api-call'
import styles from './authorization-view.scss'

const css = classNames.bind(styles)

function AuthorizationView() {
  const subdomain = window.location.host.split('.')[0]

  async function submitAuthTry(event) {
    event.preventDefault()

    const password = shadowDocument().getElementById('password').value
    await apiCall('POST', '/authorization', { password, subdomain })
    window.location.reload()
  }

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
            onClick={submitAuthTry}
            className={css('submit-button')}
          />
        </form>
      </div>
    </div>
  )
}

export default AuthorizationView
