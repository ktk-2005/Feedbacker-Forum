
function developmentAssert(cond, ...args) {
  if (cond) return
  console.error('Assertion failed', ...args)
  throw new Error('Assertion failed')
}

export default DEV ? developmentAssert : () => undefined

