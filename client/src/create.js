import React from 'react'
import { Link, Redirect } from 'react-router-dom'
// Helpers
import classNames from 'classnames/bind'
import { shadowDocument } from './shadowDomHelper'
import apiCall from './api-call'
// Styles
import styles from './scss/views/create.scss'

const css = classNames.bind(styles)

class Create extends React.Component {
  constructor(props) {
    super(props)

    this.postContainer = this.postContainer.bind(this)
    this.postSite = this.postSite.bind(this)
    this.containerForm = this.containerForm.bind(this)
    this.siteForm = this.siteForm.bind(this)
    this.form = this.form.bind(this)
    this.activateContainerForm = this.activateContainerForm.bind(this)
    this.activateSiteForm = this.activateSiteForm.bind(this)

    this.state = {
      redirectContainer: false,
      containerForm: true,
    }
  }

  // TODO: d.querySelector, better ids? is this the right way or some passing instead?
  async postContainer(event) {
    // TODO: why so slow?
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    const doc = shadowDocument()
    const inputValue = name => doc.getElementById(name).value

    const json = await apiCall('POST', '/instances/new', {
      url: inputValue('url'),
      version: inputValue('version'),
      type: 'node',
      port: inputValue('port'),
      name: inputValue('name').toLowerCase(),
    })

    this.setState({
      containerName: json.containerInfo.name,
      redirectContainer: true,
    })
  }

  async postSite(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    const doc = shadowDocument()
    const inputValue = name => doc.getElementById(name).value

    const json = await apiCall('POST', '/instances/new', {
      url: inputValue('url'),
      name: inputValue('name').toLowerCase(),
      type: 'site',
    })

    window.location.replace(`//${json.containerInfo.subdomain}.${window.location.host}`)
  }

  containerForm() {
    return (
      <form
        className={css('form-create')}
        id="containerForm"
        onSubmit={this.postContainer}
      >
        <label htmlFor="application">
          Application type
          <select
            name="application"
            id="application"
            form="containerForm"
            required
          >
            <option value="node">Node.js</option>
          </select>
        </label>
        <label htmlFor="url">
          Git URL
          <input
            type="text"
            name="url"
            id="url"
            placeholder="https://github.com/ui-router/sample-app-react"
            required
          />
        </label>
        <label htmlFor="version">
          Git Hash
          <input
            type="text"
            id="version"
            name="version"
            placeholder="master or commit hash"
            required
          />
        </label>
        <label htmlFor="name">
          Name
          <input
            type="text"
            id="name"
            name="name"
            placeholder="new-feature"
            pattern="[a-zA-Z0-9](-?[a-zA-Z0-9])*"
            minLength="3"
            maxLength="20"
            required
          />
        </label>
        <label htmlFor="port">
          Port
          <input
            type="number"
            id="port"
            min="1"
            max="65535"
            name="port"
            defaultValue="3000"
            required
          />
        </label>
        <div className={css('button-container')}>
          <Link to="/">
            <button className={css('dashboard-button')} type="button">
              Back to dashboard
            </button>
          </Link>
          <button type="submit">Create</button>
        </div>
      </form>
    )
  }

  siteForm() {
    // TODO: Add tooltip to warn about live url redirection
    return (
      <form
        className={css('form-create')}
        id="siteForm"
        onSubmit={this.postSite}
      >
        <label htmlFor="url">
          Git URL
          <input
            type="text"
            name="url"
            id="url"
            placeholder="https://codeberry.fi"
            required
          />
        </label>
        <label htmlFor="name">
          Name
          <input
            type="text"
            id="name"
            name="name"
            placeholder="new-feature"
            pattern="[a-zA-Z0-9](-?[a-zA-Z0-9])*"
            minLength="3"
            maxLength="20"
            required
          />
        </label>
        <div className={css('button-container')}>
          <Link to="/">
            <button className={css('dashboard-button')} type="button">
              Back to dashboard
            </button>
          </Link>
          <button type="submit">Create</button>
        </div>
      </form>
    )
  }

  form() {
    if (this.state.containerForm) {
      return this.containerForm()
    }
    return this.siteForm()
  }

  activateContainerForm() {
    this.setState({ containerForm: true })
  }

  activateSiteForm() {
    this.setState({ containerForm: false })
  }

  render() {
    if (this.state.redirectContainer) {
      return (
        <Redirect
          to={{
            pathname: `/logs/${this.state.containerName}`,
          }}
        />
      )
    }

    return (
      <div className={css('center-center-block')}>
        <div className={css('create-view')}>
          <h2>Create an instance</h2>
          <div className={css('selection-tabs')}>
            <button
              type="button"
              onClick={this.activateContainerForm}
              className={css({ 'current': this.state.containerForm })}
            >
              From git repository
            </button>
            <button
              type="button"
              onClick={this.activateSiteForm}
              className={css({ 'current': !this.state.containerForm })}
            >
              External live site
            </button>
          </div>
          {this.form()}
        </div>
      </div>
    )
  }
}

export default Create
