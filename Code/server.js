const express = require("express")
const fetch = require('node-fetch')
let path = require('path')
//Jan 23: not sure how the data will look when piped off MAV. Best guess for now, feel free to change.
//Jan 23: X is forward/back, Y is SidetoSide, Z is verticle. Is there a standard in flight?
//Jan 23: for sonic sensors, naming orientation is as if you were a pilot in a helicopter
//Jan 23: trying to get everything, even things we might not need 
let flightVars = {speedMag:0, speedX:0, speedY:0, speedZ:0, accelX:0, accelY:0, accelZ:0, pitchChange:0, rollChange:0,
     orientationPitch:0, orientationRoll:0, height:0, ledsON:0, speakerON:0}
const app = express()

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/src'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/flightVars', function(req, res) {
    res.send(JSON.stringify(flightVars))
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})