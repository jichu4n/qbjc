const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const monacoEditorPath = path.join(
  path.dirname(require.resolve('monaco-editor/esm/vs/editor/editor.main.js')),
  '..',
  '..',
  '..'
);

module.exports = {
  name: 'demo',
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist', 'demo'),
    clean: true,
  },
  entry: './src/demo/index.ts',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/demo/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {from: '../playground/examples/*.bas', to: 'examples/[name][ext]'},
        {
          from: path.join(
            path.dirname(require.resolve('monaco-themes/package.json')),
            'themes'
          ),
          to: 'themes',
        },
        {
          from: path.join(monacoEditorPath, 'min', 'vs', 'base', 'worker'),
          to: path.join('monaco', 'vs', 'base', 'worker'),
        },
        {
          from: path.join(
            monacoEditorPath,
            'min',
            'vs',
            'base',
            'common',
            'worker'
          ),
          to: path.join('monaco', 'vs', 'base', 'common', 'worker'),
        },
      ],
    }),
  ],
};
