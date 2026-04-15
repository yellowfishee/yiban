const config = {
  projectName: 'yiban-app',
  date: '2026-4-3',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html', '@tarojs/plugin-platform-weapp', '@tarojs/plugin-platform-h5'],
  // 小程序输出到 dist-weapp，H5 输出到 dist-h5
  // 通过 build 命令的 --type 参数区分
  defineConstants: {},
  copy: {
    patterns: [
      { from: 'src/assets/', to: 'dist/assets/' },
    ],
    options: {},
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false },
  },
  cache: {
    enable: false,
  },
  mini: {
    webpackChain(chain) {
      // 让 babel-loader 处理 @yiban/core 包
      chain.module
        .rule('script')
        .include.add(/packages[\\/]core/)
        .end();
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    webpackChain(chain) {
      // 让 babel-loader 处理 @yiban/core 包
      chain.module
        .rule('script')
        .include.add(/packages[\\/]core/)
        .end();
    },
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
