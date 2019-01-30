# This program must be launched only after identifiying the IP address of the
# server, which is written to server-ip-address file.

# Execute this program as a background process.

import os
import time
import socket
import random
import json

SERVER_IP_FNAME = "server-ip-address"
PORT = 57903 # This port is for sensor feed

# Read in the IP address
if not os.path.isfile(SERVER_IP_FNAME):
    raise OSError("A file, '" + SERVER_IP_FNAME + "', does not exist.")

f = open(SERVER_IP_FNAME, "r")
server_ip = f.read()
f.close()

if len(server_ip) == 0:
    raise TypeError("File does not have an IP address.")

# Create a UDP socket
sc = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sc.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

data = {}

while True:
    # Do get data here
    # ...
    data["speed"] = random.randint(0, 1000)

    # Send data
    sc.sendto(json.dumps(data).encode("utf-8"), (server_ip, PORT))
    time.sleep(0.1) # just for fun
