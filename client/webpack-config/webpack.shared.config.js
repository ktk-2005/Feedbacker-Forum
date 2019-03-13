const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const outputPath = path.resolve(__dirname, '../build')
const getLocalIdent = require('css-loader/lib/getLocalIdent')

// Webpack configuration shared between development and production builds
module.exports = {

  entry: {
    'embed': [
      'whatwg-fetch',    // < IE11 can't handle window.fetch()
      '@babel/polyfill', // < Pass our source through a polyfill transformation
      './src/index.js',
    ],
    'site': [
      'whatwg-fetch',    // < IE11 can't handle window.fetch()
      '@babel/polyfill', // < Pass our source through a polyfill transformation
      './src/site.js',
    ],
    'proxy-error': [
      'whatwg-fetch',    // < IE11 can't handle window.fetch()
      '@babel/polyfill', // < Pass our source through a polyfill transformation
      './src/proxy-error.js',
    ],
    'proxy-auth': [
      'whatwg-fetch',    // < IE11 can't handle window.fetch()
      '@babel/polyfill', // < Pass our source through a polyfill transformation
      './src/proxy-auth.js',
    ],
  },

  // Output to ./build/ directory
  output: {
    path: outputPath,
    filename: '[name].js',
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

      // Shim
      // {
      //   test: require.resolve('index.js'),
      //   use: 'imports-loader?this=>window',
      // },

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

      // General sass files
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
              getLocalIdent: (loaderContext, localIdentName, localName, options) => {
                if (loaderContext.resourcePath.includes('_toast.scss')) {
                  return localName
                }
                return getLocalIdent(loaderContext, localIdentName, localName, options)
              },
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
          {
            loader: '@epegzz/sass-vars-loader',
            options: {
              syntax: 'scss',
              vars: {
                'static-url': JSON.stringify(process.env.STATIC_URL || 'http://localhost:8080'),
              },
            },
          },
        ],
      },

      {
        test: /\.svg$/,
        use: 'svg-inline-loader',
      },
      {
        test: /\.png$/,
        use: 'url-loader',
      },
    ],
  },

}
