const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const outputPath = path.resolve(__dirname, '../build')

// Webpack configuration shared between development and production builds
module.exports = {

  entry: {
    embed: [
      'whatwg-fetch',    // < IE11 can't handle window.fetch()
      '@babel/polyfill', // < Pass our source through a polyfill transformation
      './src/index.js',
    ],
    site: [
      'whatwg-fetch',    // < IE11 can't handle window.fetch()
      '@babel/polyfill', // < Pass our source through a polyfill transformation
      './src/site.js',
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

      {
        test: /\.s?css$/,
        use: [
          'style-loader',
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
    ],
  },

}
