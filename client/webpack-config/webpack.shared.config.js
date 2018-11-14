const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const outputPath = path.resolve(__dirname, 'build')

// Webpack configuration shared between development and production builds
module.exports = {

  entry: [
    'whatwg-fetch',    // < IE11 can't handle window.fetch()
    '@babel/polyfill', // < Pass our source through a polyfill transformation
    './src/index.js',  // < Our own entry point
  ],

  // Output to ./build/ directory
  output: {
    path: outputPath,
  },

  plugins: [
    // Temporary copy command for test.html
    // TODO: Remove this when we have actual static content
    new CopyWebpackPlugin([
      { from: 'static/', to: outputPath },
    ], {}),
  ],

  module: {
    rules: [

      // Build *.js source files with Babel
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },

    ],
  },

}
