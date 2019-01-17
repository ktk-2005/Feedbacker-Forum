import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Route, Redirect } from 'react-router-dom'
import Build from './build-view'
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

  postContainer() {
    fetch('/api/instances/new', {
      body: JSON.stringify({
        url: document.getElementById('url').value,
        version: document.getElementById('version').value,
        type: 'node',
        port: document.getElementById('port').value,
        name: document.getElementById('name').value,
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
          containerId: json.containerInfo.id,
          redirect: true,
        })
      })
  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect to={{
          pathname: `/site/build-view/${this.state.containerId}`,
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
          Type
          <select name="type">
            <option id="type" value="node"> Node </option>
          </select>
          Git URL
          <input id="url" type="text" name="url" defaultValue="https://github.com/bqqbarbhg/docker-test-server.git" />
          Git Hash
          <input id="version" type="text" name="version" defaultValue="master" />
          Name
          <input id="name" type="text" name="name" defaultValue="name" />
          Port
          <input id="port" type="number" min="1" max="65535" name="port" defaultValue="4000" />
          <button type="button" onClick={this.postContainer}>Create</button>
        </form>
        <Route path="/build" component={Build} />
      </div>
    )
  }
}

export default connect(mapStateToProps)(Create)
