const merge = require('webpack-merge');
const webpack = require('webpack');

const path = require('./paths');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'eval-source-map',

  devServer: {
    contentBase: path.appDist,
    historyApiFallback: true,
    hot: true,
  },

  mode: 'development',

  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 热替换插件
  ],
});
