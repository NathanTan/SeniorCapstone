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

let dgram = require("dgram"); // udp
let net = require("net"); // tcp
let os = require("os");
let ip_util = require("ip");


const MULTICAST_SEND_PORT = 57901;
const RESPONSE_RECEIVE_PORT = 57902;
// https://www.iana.org/assignments/multicast-addresses/multicast-addresses.xhtml
const MULTICAST_ADDRESS = "239.0.0.7";
const DEFAULT_BROADCAST_ADDRESS = "255.255.255.255";
const MULTICAST_SEND_MESSAGE = Buffer.from("Beaver-Hawks1");
const RECEIVE_MESSAGE = Buffer.from("Beaver-Hawks2");
const MULTICAST_INTERVAL = 500; // in ms

const RECEIVE_SENSOR_DATA_PORT = 57903;
const RECEIVE_VIDEO1_PORT = 57904;
const RECEIVE_VIDEO2_PORT = 57905;

const TCP_PORT = 57800;

// Set to true to use multicast over broadcast (must also reflect that in connect.py)
const USE_MULTICAST = false;

let tcp_client = undefined;

// A broadcast of "255.255.255.255" does not work on ASUS router.
// We must use the router's subnet broadcast address.
function getBroadcastAddress() {
    let iface = null;
    let ibr = null;
    // source for iterating interfaces: https://stackoverflow.com/a/10756441
    let interfaces = os.networkInterfaces();
    for (let k in interfaces) {
        for (let k2 in interfaces[k]) {
            let address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                // having the IP, we now use subnet masking to get the broadcast address
                let br = ip_util.cidrSubnet(address.cidr).broadcastAddress;
                // Prioritize Wi-Fi interface, over Ethernet, over anything else.
                if (k.match(/wi-fi|wifi/gi)) {
                    iface = 0;
                    ibr = br;
                }
                else if (k.match(/ethernet/gi)) {
                    if (iface === null || iface > 1) {
                        iface = 1;
                        ibr = br;
                    }
                }
                else if (iface === null) {
                    iface = 2;
                    ibr = br;
                }
            }
        }
    }
    return ibr;
}

function establishConnection(onFoundRaspberryPi, onReceiveSensorData, onReceiveVideo1, onReceiveVideo2, onReceiveImportantData) {
    let sc1 = dgram.createSocket({ type: "udp4", reuseAddr: true });

    if (USE_MULTICAST) {
        // Multicast our message to all the IP addresses at the local network until we obtain a response
        sc1.on("listening", function () {
            sc1.addMembership(MULTICAST_ADDRESS);
            sc1.setMulticastTTL(5);
            interval_id = setInterval(function () {
                if (interval_id === undefined) return;

                sc1.send(MULTICAST_SEND_MESSAGE, 0, MULTICAST_SEND_MESSAGE.length, MULTICAST_SEND_PORT, MULTICAST_ADDRESS, function (err) {
                    if (err) throw err;
                });
                console.log("Server multicasting to " + MULTICAST_ADDRESS + ":" + MULTICAST_SEND_PORT);

            }, MULTICAST_INTERVAL);
        });

        sc1.bind(MULTICAST_SEND_PORT);
    }
    else {
        let broadcast_addr = getBroadcastAddress();
        if (broadcast_addr == null) {
            broadcast_addr = DEFAULT_BROADCAST_ADDRESS;
            console.log("Could not find subnet broadcast address; broadcasting to " + DEFAULT_BROADCAST_ADDRESS + " instead.");
        }

        // Broadcast our message to all the IP addresses at the local network until we obtain a response
        sc1.on("listening", function () {
            interval_id = setInterval(function () {
                if (interval_id === undefined) return;

                sc1.send(MULTICAST_SEND_MESSAGE, 0, MULTICAST_SEND_MESSAGE.length, MULTICAST_SEND_PORT, broadcast_addr, function (err) {
                    if (err) throw err;
                });
                console.log('Server broadcasting to ' + broadcast_addr + ':' + MULTICAST_SEND_PORT);

            }, MULTICAST_INTERVAL);
        });

        sc1.bind(MULTICAST_SEND_PORT, function () {
            sc1.setBroadcast(true);
        });
    }

    // Setup a listener
    let sc2 = dgram.createSocket({ type: "udp4", reuseAddr: true })

    // Listen for messages coming all interfaces of this device, at RESPONSE_RECEIVE_PORT
    sc2.bind(RESPONSE_RECEIVE_PORT);

    sc2.on("listening", function () {
        let address = sc2.address();
        console.log("Server listening on " + address.address + ":" + address.port);
    });

    // Listen for a response
    sc2.on("message", function (message, remote) {
        if (Buffer.compare(message, RECEIVE_MESSAGE) == 0 && interval_id !== undefined) {
            console.log("Response received from " + remote.address + ":" + remote.port + " - " + message);

            // stop the ping
            clearInterval(interval_id);
            interval_id = undefined;

            // close the sockets
            sc1.close();
            sc2.close();

            // setup sockets for each type of data
            initiateSensorDataReceiver(onReceiveSensorData, remote.address);
            //initiateVideo1Receiver(onReceiveVideo1, remote.address);
            //initiateVideo2Receiver(onReceiveVideo2, remote.address);
            //initiateTCPConnection(onReceiveImportantData, remote.address);

            // trigger the IP found callback
            onFoundRaspberryPi(remote.address);
        }
    });
}

function initiateSensorDataReceiver(callback, ip) {
    let server = dgram.createSocket({ type: "udp4", reuseAddr: true });

    server.on("message", function (message, remote) {
        if (remote.address != ip) return; // Accept connection with the established IP only
        //console.log("Sensor data: " + remote.address + ":" + remote.port.toString());
        callback(JSON.parse(message.toString("utf8")));
    });

    server.bind(RECEIVE_SENSOR_DATA_PORT);

    return server;
}

function initiateVideo1Receiver(callback, ip) {
    let server = dgram.createSocket({ type: "udp4", reuseAddr: true });

    server.on("message", function (message, remote) {
        if (remote.address != ip) return; // Accept connection with the established IP only
        //console.log("Video 1: " + remote.address + ":" + remote.port.toString());
        callback(message.toString("utf8"));
    });

    server.bind(RECEIVE_VIDEO1_PORT);

    return server;
}

function initiateVideo2Receiver(callback, ip) {
    let server = dgram.createSocket({ type: "udp4", reuseAddr: true });

    server.on("message", function (message, remote) {
        if (remote.address != ip) return; // Accept connection with the established IP only
        //console.log("Video 2: " + remote.address + ":" + remote.port.toString());
        callback(message.toString("utf8"));
    });

    server.bind(RECEIVE_VIDEO2_PORT);

    return server;
}

function initiateTCPConnection(callback, ip) {
    let client = net.createConnection({
        host: ip,
        port: TCP_PORT
    }, function () {
        console.log("TCP connection established");

        console.log('---------client details -----------------');
        var address = client.address();
        var port = address.port;
        var family = address.family;
        var ipaddr = address.address;
        console.log('Client is listening at port' + port);
        console.log('Client ip :' + ipaddr);
        console.log('Client is IP4/IP6 : ' + family);

        tcp_client = client;
    });

    client.setTimeout(5000);
    client.setEncoding('utf8');

    client.on("data", function (data) {
        let msg = message.toString("utf8");
        console.log("TCP message received: " + msg);
        callback(JSON.parse(msg));
    });

    client.on("close", function () {
        console.log("TCP connection closed");
        tcp_client = undefined;
    });
}

function sendJSONToMAV(data) {
    if (tcp_client !== undefined) {
        tcp_client.write(JSON.stringify(data).toString("utf8"));
    }
}

module.exports = {
    establishConnection: establishConnection,
    sendJSONToMAV: sendJSONToMAV
}
