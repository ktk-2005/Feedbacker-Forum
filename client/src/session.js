
const sessionKey = '!!feedbacker_session_data!!'
let session = null

export function getSession() {
  if (session == null) {
    try {
      const json = sessionStorage.getItem(sessionKey) || '{}'
      session = JSON.parse(json)
    } catch (error) {
      console.error('Failed to parse session storage', error)
      session = { }
    }
  }
  return session
}

export function updateSession(object) {
  const prev = session || { }
  session = { ...prev, ...object }
  sessionStorage.setItem(sessionKey, JSON.stringify(session))
}

