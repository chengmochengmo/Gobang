const { merge } = require('webpack-merge');
const webpackBase = require('./webpack.base');

module.exports = merge(
    webpackBase,
    {
        mode: 'development',
        devtool: "source-map", // source-map
        devServer: {
            host: 'localhost',
            hot: true,
            compress: true,
            port: 8080
        }
    }
)