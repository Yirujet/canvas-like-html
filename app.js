const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
const path = require('path')

app.use(express.static(path.join(__dirname, 'assets')))

app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.readFile('./index.html', (err, data) => {
        if (err) {
            throw err
        }
        res.end(data)
    })
})

app.listen(port, () => {
    console.log(`app is running in ${ port }`)
})