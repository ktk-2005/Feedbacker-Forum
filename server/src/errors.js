export class NestedError extends Error {
  constructor(message, cause = null, data = null) {
    super(message)
    this.name = 'NestedError'
    this.cause = cause
    this.data = data
  }

  static fromError(error, cause = null) {
    const newError = new NestedError(error.message, cause)
    newError.stack = error.stack
    newError.name = error.name
    return newError
  }
}

export class HttpError extends NestedError {
  constructor(status, message, cause = null, data = null) {
    super(message, cause, data)
    this.name = 'HttpError'
    this.status = status
  }
}
