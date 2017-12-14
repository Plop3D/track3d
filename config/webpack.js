const path = require('path')
const webpack = require('webpack')
const formatter = require('eslint-friendly-formatter')
const HtmlPlugin = require('html-webpack-plugin')

const cssLoaders = {
  css: getCssLoaders(),
  stylus: getCssLoaders('stylus')
}

// TODO: Create a production config with minification and no HMR.
const webpackConfig = module.exports = {
  devtool: '#cheap-module-eval-source-map',
  entry: {
    'app': ['./client/webpack/hot.js', './client/client.js']
  },
  stats: {
    colors: true,
    entrypoints: true,
    hash: false,
    timings: false,
    chunks: false,
    assets: false
  },
  output: {
    path: resolve('dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json']
  },
  module: {
    rules: [{
      test: /\.(vue)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: [resolve('views')],
      options: {formatter: formatter}
    }, {
      test: /\.(js)$/,
      loader: 'standard-loader',
      enforce: 'pre',
      include: [resolve('lib'), resolve('test')],
      options: {formatter: formatter}
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: cssLoaders,
        transformToRequire: {
          video: 'src',
          source: 'src',
          img: 'src',
          image: 'xlink:href'
        }
      }
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [resolve('lib'), resolve('test')]
    }, {
      test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 1e4,
        name: 'img/[name].[hash:7].[ext]'
      }
    }, {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 1e4,
        name: 'media/[name].[hash:7].[ext]'
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 1e4,
        name: 'fonts/[name].[hash:7].[ext]'
      }
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    })
  ]
}

for (var extension in cssLoaders) {
  webpackConfig.module.rules.push({
    test: new RegExp('\\.' + extension + '$'),
    use: cssLoaders[extension]
  })
}

function resolve (rel) {
  return path.join(__dirname, '..', '..', rel)
}

function getCssLoaders (loader) {
  var loaders = [{
    loader: 'css-loader',
    options: {
      minimize: true,
      sourceMap: true
    }
  }]
  if (loader) {
    loaders.push({
      loader: loader + '-loader',
      options: {
        sourceMap: true
      }
    })
  }
  return ['vue-style-loader'].concat(loaders)
}
