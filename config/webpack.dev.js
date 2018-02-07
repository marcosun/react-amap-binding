const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge.smart(common, {
  devtool: 'inline-source-map', // Not for production
});
