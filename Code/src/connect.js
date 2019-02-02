/*
For the following to work, both the server the Raspberry Pi need to be
connected to a common, local network.

When the server and RPi is turned on, there needs to be a way for the server
and the RPi to become aware of eachothers IP addresses.

One way to establish connection is by updating host IP addresses manually,
for both the server and the RPi code. This is not user-friendly, especially
since the MAV is going to be operated from different networks.

To determine the IP addresses, the following protocol is established:
1. Upon booting up, the RPi initiates a UDP multicast listener, for a
   maximum of 60 seconds. The listener receives a multicast at a certain port,
   known to both the server and the RPi.
2. When the server is launched, the server multicasts a special message, to the
   known port. The message is multicasted every 0.5 secods, until a response is
   received.
3. The server also starts a listener to acquire a response from the RPi.
4. Upon receiving a multicast messsage from the server, the RPi saves the IP
   address of the server, stops the listener, and sends a response to the
   server's IP address for a duration of 2 seconds, to ensure the server
   receives the message.
5. Upon receiving the response, the server initiates video and sensor listeners.
6. After echoing a response for 2 seconds, the RPi initiates three background
   processes for transmitting video and sensor data to the MAV asynchronously.
7. Following that, the RPi also establishes a TCP connection with the server for
   listenning to the important bits.
8. After the TCP connection terminates, all the spawned processes are killed.

https://www.hacksparrow.com/node-js-udp-server-and-client-example.html

*/

var dgram = require('dgram'); // udp
var net = require('net'); // tcp

var os = require('os');

/*var ifaces = os.networkInterfaces();

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
});*/

const MULTICAST_SEND_PORT = 57901;
const RESPONSE_RECEIVE_PORT = 57902;
// https://www.iana.org/assignments/multicast-addresses/multicast-addresses.xhtml
const MULTICAST_ADDRESS = '239.192.0.1';
const MULTICAST_SEND_MESSAGE = Buffer.from('Beaver-Hawks1');
const RECEIVE_MESSAGE = Buffer.from('Beaver-Hawks2');
const MULTICAST_INTERVAL = 500; // in ms

const RECEIVE_SENSOR_DATA_PORT = 57903;
const RECEIVE_VIDEO1_PORT = 57904;
const RECEIVE_VIDEO2_PORT = 57905;

const TCP_PORT = 57800;

let tpc_client = undefined;

function establishConnection(onReceiveSensorData, onReceiveVideo1, onReceiveVideo2, onReceiveImporantData) {
    let sc1 = dgram.createSocket({ type: 'udp4', reuseAddr: true })

    // Multicast our message to all the IP addresses at the local network until we obtain a response
    let interval_id = setInterval(function() {
        if (interval_id === undefined) return;

        sc1.send(MULTICAST_SEND_MESSAGE, 0, MULTICAST_SEND_MESSAGE.length, MULTICAST_SEND_PORT, MULTICAST_ADDRESS, function(err) {
            if (err) throw err;
        });
        console.log('Server multicasting to ' + MULTICAST_ADDRESS + ':' + MULTICAST_SEND_PORT);

    }, MULTICAST_INTERVAL);

    sc1.bind(MULTICAST_SEND_PORT, function () {
        //sc1.setBroadcast(true);
        sc1.addMembership(MULTICAST_ADDRESS);
        sc1.setMulticastTTL(128);
    });

    // Setup a listener
    let sc2 = dgram.createSocket({ type: 'udp4', reuseAddr: true })
    sc2.on('listening', function () {
        let address = sc2.address();
        console.log('Server listening on ' + address.address + ':' + address.port);
    });

    // Listen for a response
    sc2.on('message', function (message, remote) {
        if (Buffer.compare(message, RECEIVE_MESSAGE) == 0 && interval_id !== undefined) {
            console.log('Response received from ' + remote.address + ':' + remote.port + ' - ' + message);
            // stop the ping
            clearInterval(interval_id);
            interval_id = undefined;
            // close the socket
            sc1.close();
            sc2.close();
            // setup sockets for each type of data
            initiateSensorDataReceiver(onReceiveSensorData, remote.address);
            initiateVideo1Receiver(onReceiveVideo1, remote.address);
            initiateVideo2Receiver(onReceiveVideo2, remote.address);
            initiateTCPConnection(onReceiveImporantData, remote.address);
        }
    });

    // Listen for messages comming all interfaces of this device, at RESPONSE_RECEIVE_PORT
    sc2.bind(RESPONSE_RECEIVE_PORT, function() {
        //sc2.setBroadcast(true);
        //sc2.addMembership(MULTICAST_ADDRESS);
        //sc2.setMulticastTTL(128);
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

function initiateTCPConnection(callback, ip) {
    tpc_client = net.Socket();
    tpc_client.connect(TCP_PORT, ip, function() {
        console.log('TCP connection established');
    });

    tpc_client.on('data', function(data) {
        let msg = message.toString('utf8');
        console.log("TCP message received: " + msg);
        callback(JSON.parse(msg));
    });

    tpc_client.on('close', function() {
        console.log("TCP connection closed");
        tpc_client = undefined;
    });
}

function sendJsonToMAV(data) {
    if (tcp_client === undefined) return;
    let buffer = Buffer.from(JSON.stringify(data));
    tcp_client.write(buffer);
}

module.exports = {
    establishConnection: establishConnection,
    sendJsonToMAV: sendJsonToMAV
}
