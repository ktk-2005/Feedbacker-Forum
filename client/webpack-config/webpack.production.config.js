const webpack = require('webpack')
const shared = require('./webpack.shared.config.js')

// Webpack configuration used in final builds
module.exports = {
  ...shared,

  // Use production mode mode
  mode: 'production',
  devtool: '',

  plugins: [
    ...shared.plugins,

    new webpack.DefinePlugin({
      DEV: 'false',
    }),
  ],

}


