const express = require("express");
const fetch = require('node-fetch');
let path = require('path');

const sdgen = require('./src/sensor_data_generator'); // sensor data generator
const connector = require('./src/connect');


// -----------------------------------------------------------------------------
// >>> Helpers
// -----------------------------------------------------------------------------

function merge_dictionaries(din, dout) {
    for (i in din) {
        dout[i] = din[i];
    }
}


// -----------------------------------------------------------------------------
// >>> Main
// -----------------------------------------------------------------------------

//Jan 23: not sure how the data will look when piped off MAV. Best guess for now, feel free to change.
//Jan 23: X is forward/back, Y is SidetoSide, Z is verticle. Is there a standard in flight?
//Jan 23: for sonic sensors, naming orientation is as if you were a pilot in a helicopter
//Jan 23: trying to get everything, even things we might not need
let flightVars = {speedMag:0, speedX:0, speedY:0, speedZ:0, accelX:0, accelY:0, accelZ:0, pitchChange:0, rollChange:0,
     orientationPitch:0, orientationRoll:0, height:0, ledsON:0, speakerON:0}

let startDate = new Date();
let startTime = startDate.getTime();

let raspberryIP = undefined;

const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/src'));
app.use(express.static(__dirname + '/thirdparty'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})

// Allows for informing the client of flight variables
app.get('/flightVars', function(req, res) {
    res.send(JSON.stringify(flightVars));
})

// Allows for informing the client of Raspberry PI ip
app.get('/raspberryIP', function(req, res) {
    if (raspberryIP !== undefined) {
        res.send(raspberryIP.toString());
    }
    else {
        res.send("");
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

/*setInterval(function() {
    let date = new Date();
    let t = (date.getTime() - startTime) * 0.01;
    //flightVars.height = Math.round(sdgen.getHeight(t));

    flightVars.frontSonarColor = sdgen.getFrontSonarColor(t);
    flightVars.leftSonarColor = sdgen.getLeftSonarColor(t);
    flightVars.rightSonarColor = sdgen.getRightSonarColor(t);

}, 10);*/


// Data Receivers

// Called when we obtain the IP address of the Raspberry Pi
function onFoundRaspberryPi(ip) {
    // Inform client of the IP address for streaming video
    raspberryIP = ip;
}

function onReceiveSensorData(data) {
    merge_dictionaries(data, flightVars);
    //console.log("Sensor: " + JSON.stringify(data));

    if (typeof(flightVars.bottomSonarRange) === "number") {
        flightVars.bottomSonarColor = sdgen.convertSonarRangeToCSSColor(flightVars.bottomSonarRange);
    }

    if (typeof(flightVars.frontSonarRange) === "number") {
        flightVars.frontSonarColor = sdgen.convertSonarRangeToCSSColor(flightVars.frontSonarRange);
    }

    if (typeof(flightVars.leftSonarRange) === "number") {
        flightVars.leftSonarColor = sdgen.convertSonarRangeToCSSColor(flightVars.leftSonarRange);
    }

    if (typeof(flightVars.rightSonarRange) === "number") {
        flightVars.rightSonarColor = sdgen.convertSonarRangeToCSSColor(flightVars.rightSonarRange);
    }
}

function onReceiveVideo1(data) {
    //console.log("Video1: " + data);
}

function onReceiveVideo2(data) {
    //console.log("Video2: " + data);
}

// TCP data comes here
function onReceiveImportantData(data) {
    console.log("Important data: " + data);
}


connector.establishConnection(onFoundRaspberryPi, onReceiveSensorData, onReceiveVideo1, onReceiveVideo2, onReceiveImportantData);

// Sending data to server via TCP
//connector.sendJSONToMAV(data);

// To send data from the client side, we need to add a post fetcher at the client side that calls some
// function at the server side, that calls the sendJSONToMAV function with data.

/*setInterval(function() {
    let data = {
        stuff: Math.random(),
        lights: true
    };
    connector.sendJSONToMAV(data);
}, 500);*/
