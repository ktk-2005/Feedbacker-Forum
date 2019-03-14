import bcrypt from 'bcrypt'
import { resolveContainer, authenticateUserForContainerAccess } from './database'
import { HttpError } from './errors'

export async function authorizeUserForContainer(userId, password, subdomain) {
  const containerInfo = await resolveContainer(subdomain)

  if (!containerInfo.blob.hasOwnProperty('auth')) {
    throw new HttpError(400, "This container doesn't require authentication.")
  }

  const authSettings = containerInfo.blob.auth
  const containerPassword = authSettings.password

  if (containerPassword) {
    /* ***************** */
    /*  IMPORTANT STUFF  */
    /* ***************** */
    const passwordIsCorrect = await bcrypt.compare(password, containerPassword)
    if (passwordIsCorrect) {
      await authenticateUserForContainerAccess(subdomain, userId)
      return
    }
  }

  throw new HttpError(401, 'Incorrect password.')
}
