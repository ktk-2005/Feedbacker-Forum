import App from '@octokit/app'
import Octokit from '@octokit/rest'
import ClientOAuth2 from 'client-oauth2'
import crypto from 'crypto'
import * as R from 'ramda'
import { NestedError, HttpError } from './errors'
import { config } from './globals'
import logger from './logger'
import { storeAccessTokenForUserId, retrieveAccessTokenForUserId } from './database'

let githubApp = null
let githubAuth = null

export function isGithubAppInitialized() {
  return githubApp && githubAuth
}

// used to store temporary challenges sent to the github api
const stateStore = {}

export function initializeGitHubApp() {
  if (!config.github) {
    logger.warn('GitHub integration not initialized, missing config.')
    return
  }
  const { id, privateKey, clientId, clientSecret } = config.github
  if (!(id && privateKey && clientId && clientSecret)) {
    logger.warn('Invalid GitHub config, not initialized.')
    return
  }

  githubApp = new App({ id, privateKey })
  githubAuth = new ClientOAuth2({
    clientId,
    clientSecret,
    accessTokenUri: 'https://github.com/login/oauth/access_token',
    authorizationUri: 'https://github.com/login/oauth/authorize',
    redirectUri: `${config.siteUrl}/api/github/oauth2callback`,
  })
}

async function getAccessTokenForUser(userId) {
  const res = await retrieveAccessTokenForUserId(userId)
  if (res) {
    return res
  }

  throw new HttpError(400, `${userId} must authenticate with GitHub first.`)
}

async function getOctokitForUser(userId) {
  const accessToken = await getAccessTokenForUser(userId)
  return new Octokit({
    auth: `token ${accessToken}`,
  })
}

export async function getLoginStatus(users) {
  let error = new HttpError(401, 'User is not authenticated to GitHub')
  for (const userId of users) {
    try {
      const octokit = await getOctokitForUser(userId)
      const { data } = await octokit.users.getAuthenticated({})
      if (data) return data
    } catch (err) { error = err }
  }
  throw error
}

export async function getInstallationsWithAccess(users) {
  let error = new HttpError(401, 'User is not authenticated to GitHub')
  for (const userId of users) {
    try {
      const octokit = await getOctokitForUser(userId)
      const result = await octokit.apps.listInstallationsForAuthenticatedUser()
      return result.data.installations
    } catch (err) { error = err }
  }
  throw error
}

export async function getReposOfInstallation(installationId, users) {
  let error = new HttpError(401, 'User is not authenticated to GitHub')

  for (const userId of users) {
    try {
      const octokit = await getOctokitForUser(userId)

      const resultsPerPage = 100

      let error = null
      let repositories = []
      let resultRepos = []

      let page = 0
      do {
        try {
          const result = await octokit.apps.listInstallationReposForAuthenticatedUser({
            installation_id: installationId,
            per_page: resultsPerPage,
            page,
          })

          resultRepos = result.data.repositories
          repositories = repositories.concat(resultRepos)
        } catch (err) {
          error = err
        }
        page += 1
      } while (resultRepos.length >= resultsPerPage)

      if (repositories.length === 0 && error) {
        throw error
      }

      return repositories
    } catch (userError) {
      error = userError
    }
  }

  throw error
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

async function getInstallationAccessTokenForOwnerAndRepo(owner, repoName, users) {
  // Resolve our installation id from the clone url, this will throw if the app
  // isn't installed for the repo or it doesn't exist.
  let installationId
  try {
    installationId = await getInstallationIdForOwnerAndRepo(owner, repoName)
  } catch (error) {
    throw new NestedError('No installation found for the owner/repo combination.', error, { owner, repoName })
  }

  // The user is authorized to access these installations.
  const authorizedInstallationsForVerifiedUser = await getInstallationsWithAccess(users)
  const authorizedInstallationIds = authorizedInstallationsForVerifiedUser.map(
    installation => installation.id
  )

  // Check if the installation id is contained in the authorized installs.
  if (R.contains(installationId, authorizedInstallationIds)) {
    const accessToken = await githubApp.getInstallationAccessToken({ installationId })
    return accessToken
  }

  throw new NestedError("Installation found but user doesn't have access to it.", null, { users, owner, repoName })
}

export async function getCloneUrlForOwnerAndRepo(owner, repoName, users) {
  if (!isGithubAppInitialized()) throw new Error('GitHub integration is not initialized.')

  const accessToken = await getInstallationAccessTokenForOwnerAndRepo(owner, repoName, users)
  return `https://x-access-token:${accessToken}@github.com/${owner}/${repoName}.git`
}

async function generateNewState(users) {
  const state = await crypto.randomBytes(32).toString('base64')
  for (const userId of users) {
    stateStore[userId] = state
  }
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

export async function getOAuthRedirectUrl(users) {
  if (!isGithubAppInitialized()) throw new Error('GitHub integration is not initialized.')

  return githubAuth.code.getUri({ state: await generateNewState(users) })
}

export async function oAuthCallback(url, users) {
  if (!isGithubAppInitialized()) throw new Error('GitHub integration is not initialized.')

  for (const userId of users) {
    const { accessToken } = await githubAuth.code.getToken(url, { state: getStateForUser(userId) })
    await storeAccessTokenForUserId(userId, accessToken)
  }
}
