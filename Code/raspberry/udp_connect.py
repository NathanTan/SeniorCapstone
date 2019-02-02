import socket
import datetime
import time
import sys
import struct
import os
import subprocess

SERVER_IP_FNAME = "server-ip-address"
SPAWNED_PROCESSES_FNAME = "spawned-processes"

# https://www.iana.org/assignments/multicast-addresses/multicast-addresses.xhtml
MULTICAST_ADDRESS = '239.192.0.1'
MAX_MULTICAST_RECEIVE_DURATION = 60  # in seconds
MULTICAST_RECEIVE_PORT = 57901
MULTICAST_RECEIVE_MESSAGE = "Beaver-Hawks1"

SERVER_RESPONCE_DURATION = 2  # in seconds
SERVER_RESPONSE_TIMEOUT = 0.1  # in seconds
SERVER_RESPONSE_PORT = 57902
SERVER_RESPONSE_MESSAGE = "Beaver-Hawks2"

# First remove the original server-ip-address file
if os.path.exists(SERVER_IP_FNAME):
    os.remove(SERVER_IP_FNAME)

# Listen for multicast for at most MULTICAST_RECEIVE_DURATION seconds
sc1 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
sc1.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
#sc1.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
group = socket.inet_aton(MULTICAST_ADDRESS)
mreq = struct.pack('4sL', group, socket.INADDR_ANY)
sc1.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

sc1.bind(("", MULTICAST_RECEIVE_PORT))
sc1.settimeout(1.0)

print("Listening for data at " + MULTICAST_ADDRESS + ":" + str(MULTICAST_RECEIVE_PORT))
server_ip = None
start_time = time.time()
while True:
    try:
        data, address = sc1.recvfrom(1024)
        msg = data.decode("utf-8")
        print(msg)
        if msg == MULTICAST_RECEIVE_MESSAGE:
            server_ip = address[0]
            print("Request received from: " +
                  str(address[0]) + ":" + str(address[1]) + " - " + msg)
            sys.stdout.flush()
            break
    except socket.error:
        pass
    elapsed = time.time() - start_time
    if elapsed >= MAX_MULTICAST_RECEIVE_DURATION:
        break

# Close the socket
sc1.close()

# Validate
if server_ip is None:
    raise OSError("Did not receive any requests from server within " +
                  str(MAX_MULTICAST_RECEIVE_DURATION) + " seconds.")

# Send a response to the server
print("Sending response to " + str(server_ip) + ":" + str(SERVER_RESPONSE_PORT))
sc2 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
sc2.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
#sc2.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
#ttl = struct.pack('b', 128)
#sc2.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, ttl)

#sc2.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
sc2.bind(("", SERVER_RESPONSE_PORT))
start_time = time.time()
while True:
    sc2.sendto(SERVER_RESPONSE_MESSAGE.encode("utf-8"), (server_ip, SERVER_RESPONSE_PORT))
    time.sleep(SERVER_RESPONSE_TIMEOUT)
    elapsed = time.time() - start_time
    if elapsed >= SERVER_RESPONCE_DURATION:
        break

# Close the socket
sc2.close()

# Assuming the server received our response, which makes it listen to data at
# our, particular IP address, we are now able to send data to the server's IP
# address.

# Interprocess communication (another writes to pipe this one reads from pipe)
# https://docs.python.org/3/library/socket.html#example


# What we'll just do is create a file to store server IP address.
# Other processes can open this file, read the IP, and use the IP in their
# socket protocols for shipping the data.

f = open(SERVER_IP_FNAME, "w")
f.write(server_ip)
f.close()

# Fork
processes = []
processes.append(subprocess.Popen(["python", "sensor_data_transmitter.py"]))
processes.append(subprocess.Popen(["python", "video_transmitter1.py"]))
processes.append(subprocess.Popen(["python", "video_transmitter2.py"]))

# Save processes to file for termination
f = open(SPAWNED_PROCESSES_FNAME, "w+")
for proc in processes:
    f.write(str(proc.pid) + "\n")
f.close()
