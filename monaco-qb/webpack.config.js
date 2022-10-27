const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
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
      ],
    }),
  ],
};
