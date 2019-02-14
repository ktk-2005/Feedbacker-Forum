import uuidv4 from 'uuid/v4'
import { args } from '../globals'
import { HttpError } from '../errors'
import logger from '../logger'
import { verifyUser, resolveContainer } from '../database'

function makeUuid(length = 8) {
  return uuidv4().split('-').join('').slice(0, length)
}

const prevDebugUuid = { }
function debugUuid(length = 8) {
  const prev = prevDebugUuid[length]
  if (prev && prev.times > 0) {
    prev.times -= 1
    return prev.uuid
  }

  const next = { uuid: makeUuid(length), times: 5 }
  prevDebugUuid[length] = next
  return next.uuid
}

export function uuid(length) {
  return args.debugUuid ? debugUuid(length) : makeUuid(length)
}

// Retry a function multiple times until it succeeds
export async function attempt(fn, maxTries = 20) {
  function printFailures(failures) {
    if (failures > 0) {
      logger.error(`Failed ${failures}/${maxTries - 1} attempts ${fn.name ? `of ${fn.name}` : ''}`)
    }
  }

  // Do N attempts
  let failures = 0
  for (let i = 0; i < maxTries - 1; i++) {
    try {
      const result = await fn()
      printFailures()
      return result
    } catch (error) {
      // nop
      failures += 1
    }
  }

  printFailures(failures)

  // Do last try without try-catch
  return fn()
}
//
// Find a container subdomain from a hostname
export function resolveSubdomainFromHost(host) {
  const parts = host.split('.', 2)
  if (parts.length <= 1) throw new HttpError(400, 'Failed to extract subdomain from hostname')
  return parts[0]
}

export async function reqContainer(req) {
  const host = req.get('X-Feedback-Host')
  if (!host) throw new HttpError(400, 'No X-Feedback-Host header')
  const subdomain = resolveSubdomainFromHost(host)
  const { id, userId } = await resolveContainer(subdomain)
  return { container: id, owner: userId }
}

export async function reqUser(req) {
  const auth = req.get('Authorization')
  if (!auth) throw new HttpError(401, 'No Authorization header')
  const [scheme, token] = auth.split(' ')
  if (scheme !== 'Feedbacker') throw new HttpError(401, 'Unsupported Authorization scheme')
  const users = JSON.parse(Buffer.from(token, 'base64').toString())
  const verifiedUsers = { }

  for (const user in users) {
    if (users.hasOwnProperty(user)) {
      try {
        const secret = users[user]
        await verifyUser(user, secret)
        verifiedUsers[user] = secret
      } catch (error) { /* ignore */ }
    }
  }

  const keys = Object.keys(verifiedUsers)
  if (keys.length === 0) {
    throw new HttpError(401, 'No valid user found', null, {
      shouldRetryAuth: true,
    })
  }

  return {
    users: verifiedUsers,
    userId: keys[0],
    secret: verifiedUsers[keys[0]],
  }
}
