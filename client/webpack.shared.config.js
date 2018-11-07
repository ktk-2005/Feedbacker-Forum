const path = require('path')

// Webpack configuration shared between development and production builds
module.exports = {

  entry: [
    'whatwg-fetch',    // < IE11 can't handle window.fetch()
    '@babel/polyfill', // < Pass our source through a polyfill transformation
    './src/index.js',  // < Our own entry point
  ],

  // Output to ./build/ directory
  output: {
    path: path.resolve(__dirname, 'build')
  },

  module: {
    rules: [

      // Build *.js source files with Babel
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      }

    ]
  },

}

