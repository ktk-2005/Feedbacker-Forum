import uuidv4 from 'uuid/v4'

export function uuid(length = 8) {
  return uuidv4().split('-').join('').slice(0, length)
}

// Retry a function multiple times until it succeeds
export async function attempt(fn, maxTries = 10) {

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
  return await fn()
}
