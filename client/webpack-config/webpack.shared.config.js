const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const outputPath = path.resolve(__dirname, '../build')

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
        test: /\.meta.js$/,
        exclude: /node_modules/,
        use: [
          { loader: 'val-loader' },
        ],
      },

      // Build *.js source files with Babel
      {
        test: /\.js$/,
        exclude: /node_modules|\.meta\.js/,
        use: {
          loader: 'babel-loader',
        },
      },

      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              insertInto: () => {
                let shadowRootElement = document.querySelector('[data-feedback-shadow-root]')
                if (!shadowRootElement) {
                  shadowRootElement = document.createElement('div')
                  shadowRootElement.setAttribute('data-feedback-shadow-root', true)
                  document.body.appendChild(shadowRootElement)
                  shadowRootElement.attachShadow({ mode: 'open' })
                }
                return shadowRootElement.shadowRoot
              },
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]__[hash:base64:4]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: path.resolve(__dirname, '.'),
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },

      {
        test: /\.svg$/,
        use: 'svg-inline-loader',
      },
      {
        test: /\.png$/,
        use: 'url-loader'
      }
    ],
  },

}
