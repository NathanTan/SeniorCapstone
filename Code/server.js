const express = require("express")
const fetch = require('node-fetch')
let path = require('path')

const sdgen = require('./src/sensor_data_generator') // sensor data generator

//Jan 23: not sure how the data will look when piped off MAV. Best guess for now, feel free to change.
//Jan 23: X is forward/back, Y is SidetoSide, Z is verticle. Is there a standard in flight?
//Jan 23: for sonic sensors, naming orientation is as if you were a pilot in a helicopter
//Jan 23: trying to get everything, even things we might not need 
let flightVars = {speedMag:0, speedX:0, speedY:0, speedZ:0, accelX:0, accelY:0, accelZ:0, pitchChange:0, rollChange:0,
     orientationPitch:0, orientationRoll:0, height:0, ledsON:0, speakerON:0}

let startDate = new Date();
let startTime = startDate.getTime();

const app = express()

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/src'))
app.use(express.static(__dirname + '/thirdparty'))

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

    flightVars.frontSonarColor = sdgen.getFrontSonarColor(t);
    flightVars.leftSonarColor = sdgen.getLeftSonarColor(t);
    flightVars.rightSonarColor = sdgen.getRightSonarColor(t);

}, 10);


var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);

});

server.bind(PORT, HOST);
