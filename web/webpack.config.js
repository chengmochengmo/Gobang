const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 单独提取css
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩css插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const copyWebpackPlugin = require('copy-webpack-plugin'); // 静态资源拷贝

module.exports = {
    entry: './index.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, '../public'),
        filename: 'main.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(jpg|png|bmp|gif|svg)/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: './images',
                            publicPath: '/images',
                            esModule: false,
                        }
                    }
                ]
            },
            {
                test: /\.css/,
                use: [{
                    loader: MiniCssExtractPlugin.loader
                }, 'css-loader']
            },
            {
                test: /\.(htm|html)/,
                use: ['html-withimg-loader'] 
            },
            {
                test: /\.(js|jsx)/,
                use: {
                    loader: 'babel-loader',
                    options:{
                     "presets": ["@babel/preset-env"]
                    }
                },
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        // new CleanWebpackPlugin(), // 清除上一次打包文件
        new HtmlWebpackPlugin({
            template: "./index.html", // html模版
            filename: 'index1.html'
        }),
        new MiniCssExtractPlugin({
            chunkFilename: 'css/[name].[hash:8].css',
            filename: 'css/[name].[hash:8].css', // name是代码chunk的名字
        }),
        new OptimizeCssAssetsPlugin(),
        // new copyWebpackPlugin({
        //     patterns: [
        //         { 
        //             from: path.join(__dirname, '/css'), 
        //             to: path.join(__dirname, '../public/css')
        //         },
        //         { 
        //             from: path.join(__dirname, '/images'), 
        //             to: path.join(__dirname, '../public/images')
        //         }
        //     ],
        // })
    ],
    devServer: {
        host: 'localhost',
        hot: true,
        compress: true,
        port: 8080
    }
}