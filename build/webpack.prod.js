const { merge } = require('webpack-merge');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩css插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 清除上一次打包文件
const webpackBase = require('./webpack.base');

module.exports = merge(
    webpackBase,
    {
        mode: 'production',
        plugins: [
            new CleanWebpackPlugin(),
            new OptimizeCssAssetsPlugin()
        ]
    }
)


