const path = require('path')

// Webpack configuration shared between development and production builds
module.exports = {

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

