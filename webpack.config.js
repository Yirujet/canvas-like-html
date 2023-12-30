const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    devServer: {
        host: 'localhost',
        port: '3000',
        open: true,
        hot: true
    },
    entry: {
        index: './src/demo.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.canvas$/,
                use: [
                    'canvas-loaders'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'draw canvas like html',
            template: path.resolve(__dirname, './index.html')
        })
    ]
}