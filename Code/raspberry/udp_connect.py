import socket
import datetime
import time
import sys
import os
import subprocess

SERVER_IP_FNAME = "server-ip-address"
SPAWNED_PROCESSES_FNAME = "spawned-processes"

MAX_BROADCAST_RECEIVE_DURATION = 60  # in seconds
BROADCAST_RECEIVE_PORT = 57901
BROADCAST_RECEIVE_MESSAGE = "Beaver-Hawks1"

SERVER_RESPONCE_DURATION = 2  # in seconds
SERVER_RESPONSE_TIMEOUT = 0.1  # in seconds
SERVER_RESPONSE_PORT = 57902
SERVER_RESPONSE_MESSAGE = "Beaver-Hawks2"

# First remove the original server-ip-address file
if os.path.exists(SERVER_IP_FNAME):
    os.remove(SERVER_IP_FNAME)

# Listen for broadcast for at most BROADCAST_RECEIVE_DURATION seconds
sc = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sc.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sc.setsockopt(socket.SOL_SOCKET, socket.SO_RCVTIMEO, 1000)
sc.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
sc.bind(("", BROADCAST_RECEIVE_PORT))

server_ip = None
start_time = time.time()
while True:
    try:
        data, address = sc.recvfrom(1024)
        msg = data.decode("utf-8")
        if msg == BROADCAST_RECEIVE_MESSAGE:
            server_ip = address[0]
            print("Request received from: " +
                  str(address[0]) + ":" + str(address[1]) + " - " + msg)
            sys.stdout.flush()
            break
    except socket.error:
        pass
    elapsed = time.time() - start_time
    if elapsed >= MAX_BROADCAST_RECEIVE_DURATION:
        break

# Validate
if server_ip is None:
    raise OSError("Did not receive any requests from server within " +
                  str(MAX_BROADCAST_RECEIVE_DURATION) + " seconds.")

# Send a response to the server
print("Sending response to " + str(server_ip) + ":" + str(SERVER_RESPONSE_PORT))
sc.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 0)
start_time = time.time()
while True:
    sc.sendto(SERVER_RESPONSE_MESSAGE.encode("utf-8"),
              (server_ip, SERVER_RESPONSE_PORT))
    time.sleep(SERVER_RESPONSE_TIMEOUT)
    elapsed = time.time() - start_time
    if elapsed >= SERVER_RESPONCE_DURATION:
        break

# Assuming the server received our response, which makes it listen to data at
# our, particular IP address, we are now able to send data to the server's IP
# address.

# Interprocess communication (another writes to pipe this one reads from pipe)
# https://docs.python.org/3/library/socket.html#example


# Close the socket
sc.close()

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
