const path = require("path");

module.exports = {
    entry: './src/web/index.js',
    output: {
        path: path.resolve(__dirname,'dist'),
        filename: 'bundle.js'
    },
    module: {},
    plugins: [],
    devServer:{
        host: 'localhost',
        hot: true,
        compress: true,
        port: 8080
    }
}