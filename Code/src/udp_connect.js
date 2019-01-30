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

var dgram = require('dgram');

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
    }
    ++alias;
  });
});

const BROADCAST_SEND_PORT = 57901;
const BROADCAST_RECEIVE_PORT = 57902;
const BROADCAST_IP = '255.255.255.255';
const BROADCAST_SEND_MESSAGE = new Buffer('Beaver-Hawks1');
const BROADCAST_RECEIVE_MESSAGE = new Buffer('Beaver-Hawks2');
const BROADCAST_INTERVAL = 500; // in ms

const RECEIVE_SENSOR_DATA_PORT = 57903;
const RECEIVE_VIDEO1_PORT = 57904;
const RECEIVE_VIDEO2_PORT = 57905;

function establishConnection(onReceiveSensorData, onReceiveVideo1, onReceiveVideo2) {
    let sc1 = dgram.createSocket({ type: 'udp4', reuseAddr: true })

    // Broadcast our message to all the IP addresses at the local network until we obtain a response
    let interval_id = setInterval(function() {
        if (interval_id === undefined) return;

        sc1.send(BROADCAST_SEND_MESSAGE, 0, BROADCAST_SEND_MESSAGE.length, BROADCAST_SEND_PORT, BROADCAST_IP, function(err, bytes) {
            if (err) throw err;
            console.log('Server broadcasting to ' + BROADCAST_IP + ':' + BROADCAST_SEND_PORT);
        });

    }, BROADCAST_INTERVAL);

    sc1.bind(BROADCAST_SEND_PORT, function () {
        sc1.setBroadcast(true); 
    });

    // Setup a listener
    let sc2 = dgram.createSocket({ type: 'udp4', reuseAddr: true })
    sc2.on('listening', function () {
        let address = sc2.address();
        console.log('Server listening on ' + address.address + ':' + address.port);
    });

    // Listen for the response
    sc2.on('message', function (message, remote) {
        if (Buffer.compare(message, BROADCAST_RECEIVE_MESSAGE) == 0 && interval_id !== undefined) {
            console.log('Response received from ' + remote.address + ':' + remote.port + ' - ' + message);
            // stop the ping
            clearInterval(interval_id);
            interval_id = undefined;
            // close the socket
            sc2.close();
            // setup sockets for each type of data
            initiateSensorDataReceiver(onReceiveSensorData, remote.address);
            initiateVideo1Receiver(onReceiveVideo1, remote.address);
            initiateVideo2Receiver(onReceiveVideo2, remote.address);
        }
    });

    // Listen for broadcast messages at BROADCAST_RECEIVE_PORT
    sc2.bind(BROADCAST_RECEIVE_PORT, function() {
        sc2.setBroadcast(true);
    });
}

function initiateSensorDataReceiver(callback, ip) {
    let server = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    server.on('message', function (message, remote) {
        if (remote.address != ip) return; // Accept connection with the established IP only
        console.log(remote.address + ":" + remote.port);
        callback(JSON.parse(message.toString('utf8')));
    });

    server.bind(RECEIVE_SENSOR_DATA_PORT);

    return server;
}

function initiateVideo1Receiver(callback, ip) {
    let server = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    server.on('message', function (message, remote) {
        if (remote.address != ip) return; // Accept connection with the established IP only
        callback(message.toString('utf8'));
    });

    server.bind(RECEIVE_VIDEO1_PORT);

    return server;
}

function initiateVideo2Receiver(callback, ip) {
    let server = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    server.on('message', function (message, remote) {
        if (remote.address != ip) return; // Accept connection with the established IP only
        callback(message.toString('utf8'));
    });

    server.bind(RECEIVE_VIDEO2_PORT);

    return server;
}

module.exports = {
    // Returns a float, representing heiht in inches.
    establishConnection: establishConnection
}
