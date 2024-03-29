const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const { genCustomConsole } = require('mazey');

const WebpackLog = genCustomConsole('WebpackLog:');
const ENTRY = process.env.ENTRY;
WebpackLog.log(`ENTRY ${ENTRY}`);
const ENTRY_PATH = `./src/pages/${ENTRY}/` || './src/';
WebpackLog.log(`ENTRY_PATH ${ENTRY_PATH}`);

const plugins = [
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    // filename: `../style.min.css`
    filename: `${ENTRY}.css`,
  }),
  new HtmlWebpackPlugin({
    filename: path.resolve(__dirname, `lib/${ENTRY}.html`),
    template: path.resolve(__dirname, `${ENTRY_PATH}index.html`),
    inject: true,
    chunksSortMode: 'auto',
  }),
  // new CleanWebpackPlugin({
  //   cleanAfterEveryBuildPatterns: ['./*.css'],
  // }),
];

if (ENTRY === 'obfuscator') {
  WebpackLog.log('obfuscator');
  plugins.push(
    // https://github.com/javascript-obfuscator/javascript-obfuscator#options
    new WebpackObfuscator({
      rotateStringArray: true,
      stringArrayEncoding: ['base64'],
    }, ['excluded_bundle_name.js']),
  );
}

module.exports = {
  entry: {
    [ENTRY]: `${ENTRY_PATH}index.js`,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'lib'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // https://webpack.js.org/loaders/style-loader/#recommend
          // Do not use together style-loader and mini-css-extract-plugin.
          // "style-loader",
          // https://stackoverflow.com/questions/52571793/error-in-using-the-webpack-mini-css-extract-plugin-plugin
          // mini-css-extract-plugin's loader only takes the output of css-loader as its input.
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            // https://segmentfault.com/q/1010000009000432/a-1020000009000931
            // options: { modules: true },
          },
          {
            loader: 'sass-loader',
            options: {
              // Prefer `dart-sass`
              implementation: require('sass'),
            },
          },
        ],
      },
    ],
  },
  plugins,
};
