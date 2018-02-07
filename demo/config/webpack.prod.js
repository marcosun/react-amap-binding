const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
// Uglify && Tree Shaking for production
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge.smart(common, {
  entry: {
    vendor: [ // Bundle dependencies into a single file
      'react',
      'react-dom',
    ],
  },

  plugins: [
    new webpack.HashedModuleIdsPlugin(),

    // Bundle vendor into a seperate file
    new webpack.optimize.CommonsChunkPlugin({
      // Extract common dependencies between multiple entries to common.js
      name: ['common', 'vendor'],
    }),

    // Bundle runtime into a seperate file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime',
      minChunks: Infinity,
    }),

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
