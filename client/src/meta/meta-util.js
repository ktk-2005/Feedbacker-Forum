
module.exports = {

  // Export a JSON compatible object
  json: (obj, opts = { }) => () => ({
    cacheable: true,
    code: `module.exports = ${JSON.stringify(obj)}`,
    ...opts,
  }),

  // Export free-form code
  code: (str, opts = { }) => () => ({
    cacheable: true,
    code: `module.exports = ${str}`,
    ...opts,
  }),

  // Evaluate a metaprogram module import
  // const module = meta.eval(require('module'))
  eval: module => eval(module().code), // eslint-disable-line no-eval

}
