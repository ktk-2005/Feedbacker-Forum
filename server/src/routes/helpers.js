import uuidv4 from 'uuid/v4'
import { args } from '../globals'
import { findContainerIdBySubdomain, verifyUser } from '../database'
import HttpError from '../http-error'

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
  // Do N attempts
  for (let i = 0; i < maxTries - 1; i++) {
    try {
      const result = await fn()
      return result
    } catch (error) {
      // Nop
    }
  }

  // Do last try without try-catch
  return fn()
}

// Find a container ID from a hostname
export async function resolveContainerFromHost(host) {
  const parts = host.split('.', 2)
  if (parts.length <= 1) throw new HttpError(400, 'Failed to extract subdomain from hostname')
  const subdomain = parts[0]
  const row = await findContainerIdBySubdomain(subdomain) || []
  if (row.length < 1) throw new HttpError(400, `No container exists for subdomain ${subdomain}`)
  return row[0].id
}

export async function reqContainer(req) {
  const host = req.get('X-Feedback-Host')
  if (!host) throw new HttpError(400, 'No X-Feedback-Host header')
  const container = await resolveContainerFromHost(host)
  return { container }
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
    throw new HttpError(401, 'No valid user found')
  }

  return {
    users: verifiedUsers,
    userId: keys[0],
    secret: verifiedUsers[keys[0]],
  }
}

