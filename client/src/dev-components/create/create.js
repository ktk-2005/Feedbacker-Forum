import React from 'react'
import { Link, Redirect } from 'react-router-dom'
// Helpers
import InlineSVG from 'svg-inline-react'
import classNames from 'classnames/bind'
import { shadowDocument } from '../../shadowDomHelper'
import apiCall from '../../api-call'
import { subscribeUsers, unsubscribeUsers } from '../../globals'
// Styles
import styles from './create.scss'
// Icons
import eyeIcon from '../../assets/svg/baseline-remove_red_eye-24.svg'

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
    this.togglePassphrase = this.togglePassphrase.bind(this)
    this.toggleShowPassphrase = this.toggleShowPassphrase.bind(this)

    this.state = {
      instanceRunners: [],
      redirectContainer: false,
      containerForm: true,
      busy: false,
      usePassphrase: false,
      passphraseInputType: 'password',
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
    const usePass = this.state.usePassphrase

    this.setState({ busy: true })

    try {
      const json = await apiCall('POST', '/instances/new', {
        envs: {
          GIT_CLONE_URL: inputValue('url'),
          GIT_VERSION_HASH: inputValue('version'),
        },
        type: inputValue('application'),
        port: inputValue('port'),
        name: inputValue('name').toLowerCase(),
        password: usePass ? inputValue('password') : '',
      })

      this.setState({
        containerName: json.containerInfo.name,
        redirectContainer: true,
        busy: false,
      })
    } catch (error) {
      console.error('Failed to create container', error)
      this.setState({ busy: false })
    }
  }

  async postSite(event) {
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
    const doc = shadowDocument()
    const inputValue = name => doc.getElementById(name).value

    this.setState({ busy: true })

    try {
      const json = await apiCall('POST', '/instances/new', {
        url: inputValue('url'),
        name: inputValue('name').toLowerCase(),
        type: 'site',
      })

      this.setState({ busy: false })
      window.location.replace(`//${json.containerInfo.subdomain}.${window.location.host}${json.redirectPath}`)
    } catch (error) {
      console.error('Failed to create container', error)
      this.setState({ busy: false })
    }
  }

  togglePassphrase() {
    this.setState(prevState => (
      { usePassphrase: !prevState.usePassphrase }
    ))
  }

  toggleShowPassphrase() {
    this.setState(prevState => (
      { passphraseInputType: prevState.passphraseInputType === 'password' ? 'input' : 'password'  }
    ))
  }

  containerForm() {
    const { busy } = this.state
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
            <Link to="/create-runner" tabIndex="-1">
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
          <input key="url" type="url" name="url" id="url" placeholder="https://github.com/ui-router/sample-app-react" required />
        </label>
        <label htmlFor="version">
          Git Hash
          <input type="text" id="version" name="version" placeholder="master or commit hash" defaultValue="master" required />
        </label>
        <label htmlFor="name">
          Name
          <input key="name" type="text" id="name" name="name" placeholder="new-feature" pattern="[a-zA-Z0-9](-?[a-zA-Z0-9])*" minLength="3" maxLength="20" required />
        </label>
        <label
          htmlFor="port"
        >
          Port
          <div
            data-tooltip="Port number depends on the application type eg. node.js runs on 3000."
            data-tooltip-width="250px"
          >
            <input type="number" id="port" min="1" max="65535" name="port" defaultValue="3000" required />
          </div>
        </label>
        <label
          htmlFor="password"
        >
          Instance access restriction
          <div
            data-tooltip="If a password is set, the container can't be viewed without it."
            data-tooltip-width="250px"
          >
            <div className={css('selection-tabs')}>
              <button className={css({ 'current': !this.state.usePassphrase })} type="button" onClick={this.togglePassphrase}>Link access (default)</button>
              <button className={css({ 'current': this.state.usePassphrase })} type="button" onClick={this.togglePassphrase}>Passphrase protected</button>
            </div>
            <div className={css('passphrase-field', { 'hidden': !this.state.usePassphrase })}>
              <input type={this.state.passphraseInputType} id="password" name="password" placeholder="passphrase" minLength="5" maxLength="64" />
              <button className={css('show-button', { 'toggled': this.state.passphraseInputType !== 'password' })} type="button" onClick={this.toggleShowPassphrase}><InlineSVG src={eyeIcon} /></button>
            </div>
          </div>
        </label>
        <div className={css('button-container')}>
          <Link to="/" tabIndex="-1">
            <button
              className={css('dashboard-button')}
              type="button"
            >Back to dashboard
            </button>
          </Link>
          <button type="submit" disabled={busy}>
            Create
          </button>
        </div>
      </form>
    )
  }

  siteForm() {
    const { busy } = this.state
    return (
      <form
        className={css('form-create')}
        id="siteForm"
        onSubmit={this.postSite}
      >
        <label
          htmlFor="url"
        >
          Live website URL
          <div
            data-tooltip="Does not work if the website has absolute redirect."
            data-tooltip-width="250px"
          >
            <input
              key="url"
              type="url"
              name="url"
              id="url"
              placeholder="https://codeberry.fi"
              required
            />
          </div>
        </label>
        <label htmlFor="name">
          Name
          <input
            key="name"
            typ="text"
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
          <Link to="/" tabIndex="-1">
            <button className={css('dashboard-button')} type="button">
              Back to dashboard
            </button>
          </Link>
          <button
            type="submit"
            data-tooltip="Build can take a while, check again later if site unavailable"
            data-tooltip-width="220px"
            disabled={busy}
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

    const { busy } = this.state

    return (
      <div className={css('center-center-block', { busy })}>
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
