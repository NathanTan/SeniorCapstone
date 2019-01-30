var dgram = require('dgram');

/*

UDP Connect

For the following to work, both the server the Raspberry Pi need to be
connected to a common, local network.

When the server and RPi is turned on, there needs to be a way for the server
and the RPi to become aware of eachothers IP addresses.

One way to establish connection is by updating host IP addresses manually,
for both the server and RPi code. This is not user-friendly, especially when you
know that the MAV is going to be operated from different networks.

To determine the IP addresses, the following protocol is established:
1. Upon booting up, the RPi initiates a UDP broadcast listener, for a
    maximum of 60 seconds. The listener receives a broadcast at a certain port,
    known to both the server and the RPi.
2. When the server is launched, the server broadcasts a special message, to the
    known port. The message is broadcasted every 0.5 secods, for a maximum of 60
    seconds.
3. The server also starts a listener, to acquire a response from the RPi.
4. Upon receiving a broadcast messsage from the server, the RPi saves the IP
    address of the server, stops the listener, and initiates a sender UDP, with
    now the host IP addresss of the server.
4. The RPi sends a response,

https://www.hacksparrow.com/node-js-udp-server-and-client-example.html

*/

const BROADCAST_SEND_PORT = 57901;
const BROADCAST_RECEIVE_PORT = 57902;
const BROADCAST_IP = '255.255.255.255';
const BROADCAST_SEND_MESSAGE = new Buffer("Beaver-Hawks1");
const BROADCAST_RECEIVE_MESSAGE = new Buffer("Beaver-Hawks2");
const BROADCAST_INTERVAL = 500; // in ms

const RECEIVE_SENSOR_DATA_PORT = 57903;
const RECEIVE_VIDEO1_PORT = 57904;
const RECEIVE_VIDEO2_PORT = 57905;

function establishConnection(onReceiveSensorData, onReceiveVideo1, onReceiveVideo2) {
    let server = dgram.createSocket('udp4');

    // Broadcast our message to all the IP addresses at the local network until we obtain a response
    let interval_id = setInterval(function() {
        if (interval_id === undefined) return;

        server.send(BROADCAST_SEND_MESSAGE, 0, BROADCAST_SEND_MESSAGE.length, BROADCAST_SEND_PORT, BROADCAST_IP, function(err, bytes) {
            if (err) throw err;
            console.log('Server broadcasting to ' + BROADCAST_IP + ':' + BROADCAST_SEND_PORT);
        });

    }, BROADCAST_INTERVAL);

    // Setup a listener
    server.on('listening', function () {
        server.setBroadcast(true);
        let address = server.address();
        console.log('Server listening on ' + address.address + ":" + address.port);
    });

    // Listen for the response
    server.on('message', function (message, remote) {
        if (Buffer.compare(message, BROADCAST_RECEIVE_MESSAGE) == 0 && interval_id !== undefined) {
            console.log('Response received from ' + remote.address + ':' + remote.port + ' - ' + message);
            // stop the ping
            clearInterval(interval_id);
            interval_id = undefined;
            // close the socket
            server.close();
            // setup sockets for each type of data
            initiateSensorDataListener(onReceiveSensorData, remote.address, RECEIVE_SENSOR_DATA_PORT);
        }
    });

    // Listen for broadcast messages at BROADCAST_RECEIVE_PORT
    server.bind(BROADCAST_RECEIVE_PORT);
}

function initiateSensorDataListener(callback, ip, port) {
    let server = dgram.createSocket('udp4');

    server.on('message', function (message, remote) {
        console.log("Received sensor data ffrom " + remote.address + ":" + remote.port.toString());
        callback(JSON.parse(message));
    });

    server.bind(port, ip);

    return server;
}

module.exports = {
    // Returns a float, representing heiht in inches.
    establishConnection: establishConnection
}
