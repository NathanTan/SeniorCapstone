const express = require("express")
const fetch = require('node-fetch')
let path = require('path')

const sdgen = require('./src/sensor_data_generator') // sensor data generator

const app = express()

let flightVars = {}
let startDate = new Date();
let startTime = startDate.getTime();

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
    let t = (date.getTime() - startTime) * 0.01;
    flightVars.height = Math.round(sdgen.getHeight(t));
    flightVars.color = sdgen.getFrontSonarColor(t);
}, 10);
