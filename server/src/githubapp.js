import App from '@octokit/app'
import Octokit from '@octokit/rest'
import { NestedError } from './errors'

let githubApp = null

export function initializeGitHubApp(id, privateKey) {
  githubApp = new App({ id, privateKey })
}

async function getInstallationAccessTokenForOwnerAndRepo(owner, repoName) {
  const jwt = githubApp.getSignedJsonWebToken()
  const octokit = new Octokit({
    auth: `bearer ${jwt}`,
  })

  const installationIdResponse = await octokit.apps.findRepoInstallation({ owner, repo: repoName })
  const installationId = installationIdResponse.data.id
  const accessToken = await githubApp.getInstallationAccessToken({ installationId })

  return accessToken
}

export async function getCloneUrlForOwnerAndRepo(owner, repoName) {
  if (!githubApp) throw new NestedError('GitHub integration is not initialized.')

  const accessToken = await getInstallationAccessTokenForOwnerAndRepo(owner, repoName)
  return `https://x-access-token:${accessToken}@github.com/${owner}/${repoName}.git`
}
