const paths = require('./paths');
// Clean dist folder
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: [
    paths.appIndexJs, // App entry
  ],

  output: {
    filename: 'smooth-fetch.js',
    path: paths.appDist,
    library: 'fetch',
    libraryTarget: 'umd',
  },

  devtool: 'source-map',

  module: {
    rules: [
      { // Javascript
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel-loader',
      },
    ],
  },

  plugins: [
    // Clean dist folder
    new CleanWebpackPlugin(
      [paths.appDist],
      {
        root: paths.appPath,
        verbose: true,
      }
    ),
  ],
};
