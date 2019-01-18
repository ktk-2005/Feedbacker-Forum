
export default class HttpError extends Error {
  constructor(status, message, data = { }) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

