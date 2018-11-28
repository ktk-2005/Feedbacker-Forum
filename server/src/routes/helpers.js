import uuidv4 from 'uuid/v4'
import { args } from '../globals'

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
