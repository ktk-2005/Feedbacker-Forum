import uuidv4 from 'uuid/v4'

export function uuid(length = 8) {
  return uuidv4().split('-').join('').slice(0, length)
}
