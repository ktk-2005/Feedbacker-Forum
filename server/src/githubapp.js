import App from '@octokit/app'
import Octokit from '@octokit/rest'
import ClientOAuth2 from 'client-oauth2'
import crypto from 'crypto'
import * as R from 'ramda'
import { NestedError, HttpError } from './errors'
import { config } from './globals'

let githubApp = null
let githubAuth = null

const stateStore = {}
const accessTokenStore = {}

export function initializeGitHubApp() {
  const { id, privateKey, clientId, clientSecret } = config.github

  githubApp = new App({ id, privateKey })
  githubAuth = new ClientOAuth2({
    clientId,
    clientSecret,
    accessTokenUri: 'https://github.com/login/oauth/access_token',
    authorizationUri: 'https://github.com/login/oauth/authorize',
    redirectUri: `${config.siteUrl}/api/github/oauth2callback`,
  })
}

export function getAccessTokenForUser(userId) {
  if (accessTokenStore.hasOwnProperty(userId)) {
    return accessTokenStore[userId]
  }
  console.log(accessTokenStore)
  throw new HttpError(400, `${userId} must authenticate with GitHub first.`)
}

function getOctokitForUser(userId) {
  const { accessToken } = getAccessTokenForUser(userId)
  return new Octokit({
    auth: `token ${accessToken}`,
  })
}

export async function getInstallationsWithAccess(userId) {
  const octokit = getOctokitForUser(userId)
  const result = await octokit.apps.listInstallationsForAuthenticatedUser()
  return result.data.installations
}

export async function getReposOfInstallation(installationId, userId) {
  const octokit = getOctokitForUser(userId)
  const result = await octokit.apps.listInstallationReposForAuthenticatedUser({
    installation_id: installationId,
  })
  return result
}

async function getInstallationIdForOwnerAndRepo(owner, repoName) {
  const jwt = githubApp.getSignedJsonWebToken()
  const octokit = new Octokit({
    auth: `bearer ${jwt}`,
  })

  const installationIdResponse = await octokit.apps.findRepoInstallation({ owner, repo: repoName })
  const installationId = installationIdResponse.data.id
  return installationId
}

async function getInstallationAccessTokenForOwnerAndRepo(owner, repoName, userId) {
  // Resolve our installation id from the clone url, this will throw if the app
  // installed for the repo or it doesn't exist.
  const installationId = await getInstallationIdForOwnerAndRepo(owner, repoName)

  // The user is authorized to access these installations.
  const authorizedInstallationsForVerifiedUser = await getInstallationsWithAccess(userId)
  const authorizedInstallationIds = R.map(installation => installation.id,
    authorizedInstallationsForVerifiedUser)

  // Check if the installation id is contained in the authorized installs.
  if (R.contains(installationId, authorizedInstallationIds)) {
    const accessToken = await githubApp.getInstallationAccessToken({ installationId })
    return accessToken
  }

  throw new NestedError('Private repository')
}

export async function getCloneUrlForOwnerAndRepo(owner, repoName, userId) {
  const accessToken = await getInstallationAccessTokenForOwnerAndRepo(owner, repoName, userId)
  return `https://x-access-token:${accessToken}@github.com/${owner}/${repoName}.git`
}

async function generateNewState(userId) {
  const state = await crypto.randomBytes(32).toString('base64')
  stateStore[userId] = state
  return state
}

function getStateForUser(userId) {
  if (stateStore.hasOwnProperty(userId)) {
    const value = stateStore[userId]
    delete stateStore[userId]

    return value
  }

  return null
}

export async function getOAuthRedirectUrl(userId) {
  return githubAuth.code.getUri({ state: await generateNewState(userId) })
}

export async function oAuthCallback(url, userId) {
  const accessToken = await githubAuth.code.getToken(url, { state: getStateForUser(userId) })
  accessTokenStore[userId] = accessToken
}
