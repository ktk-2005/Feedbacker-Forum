
export function checkInt(name, value) {
  if (Number.isInteger(value)) return value
  if (value === undefined) {
    throw new Error(`Expected an integer for ${name}, got nothing`)
  } else {
    throw new Error(`Expected an integer for ${name}, got ${typeof value} ${value}`)
  }
}

export function checkBool(name, value) {
  if (typeof value === 'boolean') return value
  if (value === undefined) {
    throw new Error(`Expected a boolean for ${name}, got nothing`)
  } else {
    throw new Error(`Expected a boolean for ${name}, got ${typeof value} ${value}`)
  }
}

