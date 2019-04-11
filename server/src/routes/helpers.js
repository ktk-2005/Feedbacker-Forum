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

// Find a container subdomain from a hostname
export function resolveSubdomainFromOrigin(origin) {
  const match = origin.match(/^(https?:\/\/)?([^.]+)\..*$/)
  if (!match) throw new HttpError(400, 'Failed to extract subdomain from origin')
  return match[2]
}

export async function reqContainer(req) {
  const origin = req.get('Origin')
  if (!origin) throw new HttpError(400, 'No Origin header')
  const subdomain = resolveSubdomainFromOrigin(origin)
  const { id, userId } = await resolveContainer(subdomain)
  return { container: id, owner: userId }
}

export async function reqUser(req) {
  let token = req.signedCookies.FeedbackAuth

  if (args.testAuth || args.testApi) {
    token = req.get('X-Test-Auth')
  }

  if (!token) {
    throw new HttpError(401, 'No authorization cookie', null, {
      shouldRetryAuth: true,
    })
  }
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

