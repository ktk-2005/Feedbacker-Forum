
// List all the endpoints of an Express application
// https://github.com/expressjs/express/issues/3308#issuecomment-300957572
//
// This will probably break with newer Express versions...
export default (app) => {
  const results = []

  function split(thing) {
    if (typeof thing === 'string') {
      return thing.split('/')
    } if (thing.fast_slash) {
      return ''
    }
    const match = thing.toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\/]|[^.*+?^${}()|[\]\\/])*)\$\//)
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : `<complex:${thing.toString()}>`
  }

  function print(path, layer) {
    if (layer.route) {
      layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
    } else if (layer.method) {
      const method = layer.method.toUpperCase()
      let apiPath = path.concat(split(layer.regexp)).filter(Boolean).join('/')
      if (!apiPath.startsWith('/')) apiPath = `/${apiPath}`
      results.push({ method, path: apiPath })
    }
  }

  // eslint-disable-next-line no-underscore-dangle
  app._router.stack.forEach(print.bind(null, []))

  return results
}

