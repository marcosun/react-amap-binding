const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
// Uglify && Tree Shaking for production
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge.smart(common, {
  plugins: [
    // Uglify && Tree Shaking for production environment
    new UglifyJSPlugin({
      // Very Important! Restrict source map file to administrator ONLY!
      sourceMap: true,
    }),

    new webpack.DefinePlugin( // Enable minification
      {
        'process.env': {
          'BABEL_ENV': JSON.stringify('production'),
          'NODE_ENV': JSON.stringify('production'),
        },
      }
    ),
  ],
});
