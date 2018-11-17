
module.exports = {
  json: (obj) => {
    const json = JSON.stringify(obj)
    return () => ({
      code: `module.exports = ${json}`,
    })
  }
}

