const shared = require('./webpack.shared.config.js')

// Webpack configuration used in final builds
module.exports = {
  ...shared,

  // Use production mode mode
  mode: 'production',
  devtool: '',

}


