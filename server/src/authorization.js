import bcrypt from 'bcrypt'
import { resolveContainer, authenticateUserForContainerAccess } from './database'
import { HttpError } from './errors'
import { attempt, uuid } from './routes/helpers'

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
      return attempt(async () => {
        const authToken = uuid(32)
        await authenticateUserForContainerAccess(subdomain, userId, authToken)
        return authToken
      })
    }
  }

  throw new HttpError(403, 'Incorrect password.')
}
