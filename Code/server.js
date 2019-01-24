const express = require("express")
const fetch = require('node-fetch')
let path = require('path')

let flightVars = {}

const sdgen = require('./src/randomizer') // sensor data generator

const app = express()

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/src'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/flightVars', function(req, res) {
    res.send(JSON.stringify(flightVars));
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

setInterval(function() {
    let date = new Date();
    let t = date.getTime();
    flightVars.height = sdgen.getHeight(t);
}, 100);