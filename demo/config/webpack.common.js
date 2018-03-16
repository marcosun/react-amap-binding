const paths = require('./paths');
// Dynamically generate index.html with multiple entries
const HtmlWebpackPlugin = require('html-webpack-plugin');
// Clean dist folder
const CleanWebpackPlugin = require('clean-webpack-plugin');
// Prevents users from importing files from outside of src/
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
  entry: {
    vendor: [ // Bundle dependencies into a single file
      'babel-polyfill',
    ],
    app: [
      paths.appIndexJs, // App entry
    ],
  },

  output: {
    filename: 'assets/js/[name].bundle.[hash].js',
    chunkFilename: 'assets/js/[name].chunk.[chunkhash].js',
    path: paths.appDist,
  },

  devtool: 'source-map',

  module: {
    rules: [

      { // Javascript
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel-loader',
      },

      { // Images
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'images/[name][hash].[ext]',
            },
          },
        ],
      },

      { // Fonts
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'fonts/[name][hash].[ext]',
            },
          },
        ],
      },
    ],
  },

  plugins: [
    // Prevents users from importing files from outside of src/
    new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),

    // Clean dist folder
    new CleanWebpackPlugin(
      ['dist'],
      {
        root: paths.appPath,
        verbose: true,
      }
    ),

    // Dynamically generate index.html with multiple entries
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: require('html-webpack-template'),

      // Optional
      title: 'ibus component', // HTML title
      appMountId: 'app', // React will initialise on HTML tag with this id
      chunks: ['runtime', 'vendor', 'app'], // Specify javascript load order
      chunksSortMode: 'manual',
    }),
  ],

  resolve: {
    alias: {
      'amap-plugin-canvas-polyline': paths.libraryComponent,
    },
  },
};
