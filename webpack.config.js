const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    devServer: {
        host: '172.16.0.30',
        port: '3000',
        open: true,
        hot: true
    },
    resolveLoader: {
        modules: ['node_modules', './loaders'],
        extensions: ['.canvas'],
        alias: {
            'canvas-loader': './loaders/index.js'
        }
    },
    entry: {
        index: process.env.mode === 'production' ? './src/CanvasLikeHtml.js' : './src/demo.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        library: 'CanvasLikeHtml'
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