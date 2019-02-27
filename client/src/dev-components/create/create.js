import React from 'react'
import { Link, Redirect } from 'react-router-dom'
// Helpers
import classNames from 'classnames/bind'
import { shadowDocument } from '../../shadowDomHelper'
import apiCall from '../../api-call'
import { subscribeUsers, unsubscribeUsers } from '../../globals'
// Styles
import styles from './create.scss'

const css = classNames.bind(styles)

class Create extends React.Component {
  constructor(props) {
    super(props)

    this.postContainer = this.postContainer.bind(this)
    this.getInstanceRunnersFromServer = this.getInstanceRunnersFromServer.bind(this)
    this.postSite = this.postSite.bind(this)
    this.containerForm = this.containerForm.bind(this)
    this.siteForm = this.siteForm.bind(this)
    this.activateContainerForm = this.activateContainerForm.bind(this)
    this.activateSiteForm = this.activateSiteForm.bind(this)

    this.state = {
      instanceRunners: [],
      redirectContainer: false,
      containerForm: true,
    }
  }

  componentDidMount() {
    this.userSub = subscribeUsers(this.getInstanceRunnersFromServer)
  }

  componentWillUnmount() {
    unsubscribeUsers(this.userSub)
  }

  async getInstanceRunnersFromServer() {
    const response = await apiCall('GET', '/instanceRunners')

    this.setState({ instanceRunners: response })
  }

  activateContainerForm() {
    this.setState({ containerForm: true })
  }

  activateSiteForm() {
    this.setState({ containerForm: false })
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
      type: inputValue('application'),
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
        id="form"
        onSubmit={this.postContainer}
      >
        <label htmlFor="application">
          Application type
          <div className={css('inline-button')}>
            <select name="application" id="application" form="form" required>
              {this.state.instanceRunners.filter(runner => (
                (runner.status === 'success' || !runner.status)
              )).map(runner => (
                <option key={runner.tag} value={runner.tag}>{runner.tag}</option>
              ))}
            </select>
            <Link to="/create-runner">
              <button
                className={css('new-runner-button')}
                type="button"
              >New runner
              </button>
            </Link>
          </div>
        </label>
        <label htmlFor="url">
          Git URL
          <input type="text" name="url" id="url" placeholder="https://github.com/ui-router/sample-app-react" required />
        </label>
        <label htmlFor="version">
          Git Hash
          <input type="text" id="version" name="version" placeholder="master or commit hash" defaultValue="master" required />
        </label>
        <label htmlFor="name">
          Name
          <input type="text" id="name" name="name" placeholder="new-feature" pattern="[a-zA-Z0-9](-?[a-zA-Z0-9])*" minLength="3" maxLength="20" required />
        </label>
        <label
          htmlFor="port"
          data-tooltip="Port number depends on the application type eg. node.js runs on 3000."
          data-tooltip-width="250px"
        >
          Port
          <input type="number" id="port" min="1" max="65535" name="port" defaultValue="3000" required />
        </label>
        <div className={css('button-container')}>
          <Link to="/">
            <button
              className={css('dashboard-button')}
              type="button"
            >Back to dashboard
            </button>
          </Link>
          <button type="submit">
            Create
          </button>
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
        <label
          htmlFor="url"
          data-tooltip="Does not work if the website has absolute redirect."
          data-tooltip-width="250px"
        >
          Live website URL
          <input
            type="url"
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
          <button
            type="submit"
            data-tooltip="Build can take a while, check again later if site unavailable"
            data-tooltip-width="220px"
          >
            Create
          </button>
        </div>
      </form>
    )
  }

  render() {
    if (this.state.redirectContainer) {
      return (
        <Redirect to={{
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
          {this.state.containerForm ? this.containerForm() : this.siteForm()}
        </div>
      </div>
    )
  }
}

export default Create
