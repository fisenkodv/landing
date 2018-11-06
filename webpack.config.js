const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

filesToCopy = [
  { from: './src/scss/fontawesome/fonts', to: './assets/fonts', flatten: true },
  { from: './src/*.txt', to: './', flatten: true }
];

const config = {
  entry: {
    index: './src/index.ts'
  },
  output: {
    filename: 'assets/index.[hash].js'
  },
  module: {
    rules: [
      {
        test: /.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'resolve-url-loader', 'sass-loader']
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
        test: /\.(png|gif|jpeg|jpg|eot|woff2|woff|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
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
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    noInfo: true,
    hot: true,
    port: 9000
  },
  performance: {
    hints: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: 'head',
      template: '!!ejs-compiled-loader!./src/index.ejs',
      data: {
        head: {
          title: 'Dmitry Fisenko - Software Engineer',
          meta: {
            author: 'Dmitry Fisenko',
            description: 'Dmitry Fisenko',
            keywords: 'Dmitry Fisenko, developer, software, engineer'
          }
        },
        body: {
          name: 'Dmitry Fisenko',
          position: 'Software Engineer',
          email: 'fisenkodv@gmail.com'
        },
        contacts: [
          {
            class: 'github',
            title: 'GitHub',
            link: 'https://gitghub.com/fisenkodv'
          },
          {
            class: 'linkedin-in',
            title: 'LinkedIn',
            link: 'https://linkedin.com/in/fisenkodv'
          },
          {
            class: 'twitter',
            title: 'Twitter',
            link: 'https://twitter.com/fisenkodv'
          },
          {
            class: 'facebook-f',
            title: 'Facebook',
            link: 'https://facebook.com/fisenkodv'
          },
          {
            class: 'instagram',
            title: 'Instagram',
            link: 'https://instagram.com/fisenkodv'
          }
        ]
      },
      minify: {
        html5: true,
        includeAutoGeneratedTags: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        removeEmptyAttributes: true
      }
    }),
    new CopyWebpackPlugin(filesToCopy),
    new CleanWebpackPlugin(['dist/*.*']),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].[hash].css',
      chunkFilename: 'assets/[id].[hash].css'
    })
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
  ]
};

module.exports = (env, argv) => {
  const appVersion =
    argv.appVersion ||
    fs
      .readFileSync('./package.json')
      .toString()
      .match(/"version": "(\d+\.\d+\.\d+.*?)"/)[1];

  config.output.path = path.resolve(__dirname, './dist');

  console.log(`Version: ${appVersion}`);
  console.log('Output directory', config.output.path);

  if (argv.mode === 'production') {
    console.log('Build in prod mode');
    config.mode = 'production';
    config.devtool = '';
    config.plugins = [
      ...config.plugins,
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    ];
  } else {
    console.log('Build in dev mode');
    config.mode = 'development';
    config.devtool = '#source-map';
    config.plugins = [
      ...config.plugins
      //new BundleAnalyzerPlugin()
    ];
  }

  return config;
};
