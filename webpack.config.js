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
    // resolveLoader: {
    //     modules: ['node_modules', './loaders'],
    //     extensions: ['.canvas'],
    //     alias: {
    //         'canvas-loader': './loaders/index.mjs'
    //     }
    // },
    entry: {
        index: process.env.mode === 'production' ? './src/CanvasLikeHtml.js' : './src/demo.js'
        // index: './src/CanvasLikeHtml.js'
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