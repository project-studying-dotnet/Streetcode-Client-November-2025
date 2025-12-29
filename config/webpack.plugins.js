const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = [
    new HtmlWebpackPlugin({
        template: './public/index.html',
        manifest: "./public/manifest.json",
        favicon: "./public/favicon.ico",
        inject: true,
    }),
    new webpack.DefinePlugin({
        'process.env.REACT_APP_BACKEND_URL': JSON.stringify(process.env.REACT_APP_BACKEND_URL),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
].filter(Boolean);