import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
// Helpers
import classNames from 'classnames/bind'
import { shadowDocument } from './shadowDomHelper'
// Styles
import styles from './scss/views/create.scss'

const css = classNames.bind(styles)

const mapStateToProps = (state) => {
  const users = (state.persist || {}).users || {}
  const userKeys = Object.keys(users)
  let publicKey = ''
  if (userKeys.length >= 1) {
    [publicKey] = userKeys
  }
  return {
    userPublic: publicKey,
  }
}

class Create extends React.Component {
  constructor(props) {
    super(props)

    this.postContainer = this.postContainer.bind(this)

    this.state = {
      redirect: false,
    }
  }

  // TODO: d.querySelector, better ids? is this the right way or some passing instead?
  postContainer() {
    fetch('/api/instances/new', {
      body: JSON.stringify({
        url: shadowDocument().getElementById('url').value,
        version: shadowDocument().getElementById('version').value,
        type: 'node',
        port: shadowDocument().getElementById('port').value,
        name: shadowDocument().getElementById('name').value,
        userId: this.props.userPublic,
      }),
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then((json) => {
        this.setState({
          containerName: json.containerInfo.name,
          redirect: true,
        })
      })
  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect to={{
          pathname: `/build-view/${this.state.containerName}`,
        }}
        />
      )
    }

    return (
      <div className={css('create-view')}>
        <h2>Create an instance</h2>
        <form
          className={css('form-create')}
          id="form"
        >
          <label htmlFor="application">
            Application type
            <select name="application" id="application" form="form" required>
              <option value="node">Node.js</option>
            </select>
          </label>
          <label htmlFor="url">
            Git URL
            <input type="text" name="url" id="url" placeholder="https://github.com/ui-router/sample-app-react" required />
          </label>
          <label htmlFor="version">
            Git Hash
            <input type="text" id="version" name="version" placeholder="master or commit hash" required />
          </label>
          <label htmlFor="name">
            Name
            <input type="text" id="name" name="name" placeholder="new-feature" pattern="[a-z0-9](-?[a-z0-9])" minLength="3" maxLength="20" required />
          </label>
          <label htmlFor="port">
            Port
            <input type="number" id="port" min="1" max="65535" name="port" defaultValue="3000" required />
          </label>
          <button type="button" onClick={this.postContainer}>
            Create
          </button>
        </form>
      </div>
    )
  }
}

export default connect(mapStateToProps)(Create)
