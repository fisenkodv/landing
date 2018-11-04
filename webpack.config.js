const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';
const appVersion =
  process.env.APP_VERSION ||
  fs
    .readFileSync('./package.json')
    .toString()
    .match(/"version": "(\d+\.\d+\.\d+.*?)"/)[1];
const outputDirectory = path.resolve(__dirname, process.env.APP_OUT_PATH || './dist');
const runAnalyzer = process.env.RUN_UNALYZER === 'true';
const htmlPlugins = require('./config/html-webpack-plugin');

console.log(`Version: ${appVersion}`);
if (isProd) {
  console.log('Build in prod mode');
} else {
  console.log('Build in dev mode');
}

console.log('Output directory', outputDirectory);

filesToCopy = [
  { from: './src/assets/about/team/*', to: './assets/', flatten: true },
  { from: './src/*.txt', to: './', flatten: true }
];

module.exports = {
  entry: {
    index: './src/index.ts'
  },
  output: {
    path: outputDirectory,
    filename: 'index.[hash].js'
  },
  module: {
    rules: [
      {
        test: /.scss$/,
        loaders: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader?sourceMap']
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          },
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.(png|gif|GIF|jpeg|jpg|eot|woff2|woff|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    hot: true
  },
  performance: {
    hints: false
  },
  plugins: [
    ...htmlPlugins(isProd, appVersion),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new CopyWebpackPlugin(filesToCopy),
    new CleanWebpackPlugin(['dist/*.*', 'dist/icons-*', 'dist/assets/']),
    /*new FaviconsWebpackPlugin({
      logo: './src/assets/favicon.svg',
      inject: true,
      prefix: 'icons-[hash]/',
      emitStats: true,
      statsFilename: 'iconstats-[hash].json',
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: true,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: true
      }
    })*/
  ],
  devtool: '#eval-source-map'
};

if (runAnalyzer) {
  console.log('Build with bundle analyzer');
  module.exports.plugins = (module.exports.plugins || []).concat([new BundleAnalyzerPlugin()]);
}

if (isProd) {
  module.exports.devtool = '#source-map';
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
        APP_VERSION: `"${appVersion}"`
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
} else {
  module.exports.devtool = '#source-map';
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        APP_VERSION: `"${appVersion}-dev"`
      }
    })
  ]);
}
