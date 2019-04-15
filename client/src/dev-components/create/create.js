import React from 'react'
import { Link, Redirect } from 'react-router-dom'
import * as R from 'ramda'
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
    this.activateGithubPanel = this.activateGithubPanel.bind(this)
    this.deactivateGithubPanel = this.deactivateGithubPanel.bind(this)
    this.selectedInstallationChanged = this.selectedInstallationChanged.bind(this)
    this.togglePassphrase = this.togglePassphrase.bind(this)
    this.toggleShowPassphrase = this.toggleShowPassphrase.bind(this)
    this.githubLogout = this.githubLogout.bind(this)

    this.state = {
      instanceRunners: [],
      redirectContainer: false,
      containerForm: true,
      githubPanel: false,
      busy: false,
      github: null,
      githubBusy: true,
      githubRepos: [],
      usePassphrase: false,
      passphraseInputType: 'password',
    }

    this.fetchGithubLoginInfo()
  }


  componentDidMount() {
    this.userSub = subscribeUsers(this.getInstanceRunnersFromServer)

    const { segment } = this.props.match.params
    if (segment === 'github') {
      this.setState({ githubPanel: true })
      window.history.pushState(null, null, '/create')
    }
  }

  componentWillUnmount() {
    unsubscribeUsers(this.userSub)
  }

  async getInstanceRunnersFromServer() {
    const response = await apiCall('GET', '/instanceRunners')

    this.setState({ instanceRunners: response })
  }

  async fetchGithubLoginInfo() {
    try {
      const status = await apiCall('GET', '/github/status', null, { noToast: true })
      this.setState({ github: status })
    } catch (error) {
      // not logged in to github
    } finally {
      this.setState({ githubBusy: false })
    }
  }

  activateContainerForm() {
    this.setState({ containerForm: true })
  }

  activateSiteForm() {
    this.setState({ containerForm: false })
  }

  activateGithubPanel() {
    this.setState({ githubPanel: true })
  }

  deactivateGithubPanel() {
    this.setState({ githubPanel: false })
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

    // check if the a repo has been chosen directly from github
    let url
    if (this.state.githubPanel) {
      url = inputValue('repository')
    } else {
      url = inputValue('url')
    }

    try {
      const json = await apiCall('POST', '/instances/new', {
        envs: {
          GIT_CLONE_URL: url,
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

  async githubLogin() {
    const { url } = await apiCall('GET', '/github/oauth2login')
    window.location.assign(url)
  }

  async selectedInstallationChanged() {
    const shadow = shadowDocument()
    const selectElement = shadow.getElementById('installation')
    const selectedValue = selectElement.value
    const { repos } = await apiCall('GET', `/github/repos/${selectedValue}`)
    this.setState({ githubRepos: repos })
  }

  async githubLogout() {
    await apiCall('POST', '/github/logout')
    this.setState({
      github: null,
      githubRepos: [],
    })
  }

  isGithubPanelActiveAndNotLoggedIn() {
    return this.state.githubPanel && !R.path(['github', 'status'], this.state)
  }

  githubPanel() {
    if (this.state.githubBusy) {
      return (<p>Loading GitHub login information...</p>)
    }

    if (this.state.github && this.state.github.status) {
      return (
        <div className="github_integration">
          <p><button type="button" onClick={this.githubLogout} className={css('logout-button')}>Logout</button> You are logged in to GitHub as {this.state.github.status.login}.</p>
          <label htmlFor="installation">
            Please select an installation
            <select defaultValue="-1" name="installation" id="installation" form="form" onChange={this.selectedInstallationChanged}>
              <option value="-1" disabled hidden>Select...</option>
              {this.state.github.installations.map(installation => (
                <option
                  key={installation.id}
                  value={installation.id}
                >
                  {installation.account.login}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="repository">
            Please select a repository
            <select defaultValue="-1" name="repository" id="repository" disabled={this.state.githubRepos.length === 0} form="form">
              <option value="-1" disabled hidden>Select...</option>
              {this.state.githubRepos.map(repo => (
                <option
                  key={repo.id}
                  value={repo.clone_url}
                >
                  {repo.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )
    } else {
      return (<button className={css('login-with-github-button')} type="button" onClick={this.githubLogin}><img src="/github/GitHub-Mark-120px-plus.png" className={css('github-logo')} alt="GitHub logo" /> Connect to GitHub</button>)
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
        <div className={css('selection-tabs')}>
          <button
            type="button"
            onClick={this.deactivateGithubPanel}
            className={css({ 'current': !this.state.githubPanel })}
          >
            Public Git repository
          </button>
          <button
            type="button"
            onClick={this.activateGithubPanel}
            className={css({ 'current': this.state.githubPanel })}
          >
            Private GitHub
          </button>
        </div>
        {this.state.githubPanel ? this.githubPanel() : (
          <label htmlFor="url">
            Git Repository URL
            <input type="text" name="url" id="url" placeholder="https://github.com/ui-router/sample-app-react" required />
          </label>
        )}
        <label htmlFor="version">
          Git Hash
          <input type="text" id="version" name="version" placeholder="master or commit hash" defaultValue="master" disabled={this.isGithubPanelActiveAndNotLoggedIn()} required />
        </label>
        <label htmlFor="name">
          Name
          <input key="name" type="text" id="name" name="name" placeholder="new-feature" pattern="[a-zA-Z0-9](-?[a-zA-Z0-9])*" minLength="3" maxLength="20" disabled={this.isGithubPanelActiveAndNotLoggedIn()} required />
        </label>
        <label
          htmlFor="port"
        >
          Port
          <div
            data-tooltip="Port number depends on the application type eg. node.js runs on 3000."
            data-tooltip-width="250px"
          >
            <input type="number" id="port" min="1" max="65535" name="port" defaultValue="3000" disabled={this.isGithubPanelActiveAndNotLoggedIn()} required />
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
              <button className={css({ 'current': !this.state.usePassphrase })} type="button" onClick={this.togglePassphrase} disabled={this.isGithubPanelActiveAndNotLoggedIn()}>Link access (default)</button>
              <button className={css({ 'current': this.state.usePassphrase })} type="button" onClick={this.togglePassphrase} disabled={this.isGithubPanelActiveAndNotLoggedIn()}>Passphrase protected</button>
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
