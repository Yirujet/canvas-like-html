const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    devServer: {
        host: 'localhost',
        port: '8888',
        open: true,
        hot: true
    },
    resolveLoader: {
        modules: ['node_modules', './loaders'],
        extensions: ['.canvas'],
        alias: {
            'canvas-loader': './loaders/canvas-loader.js'
        }
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
                    'canvas-loader'
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