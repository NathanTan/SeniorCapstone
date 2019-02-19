# This program must be launched only after identifiying the IP address of the
# server, which is written to server-ip-address file.

# Execute this program as a background process.

import os
import time
import socket
import random
import json

SERVER_IP_FNAME = "server-ip-address"
PORT = 57904 # This port is for video 1

# Modify this callback to return the data you need
# @return Assumes this callback function returns a string
def getData():
    data = ""
    time.sleep(0.1) # just for fun
    return data

def main():
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
    if os.name == 'nt':
        sc.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    else:
        sc.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
    sc.bind(("", PORT))

    # Send data
    while True:
        sc.sendto(getData().encode("utf-8"), (server_ip, PORT))
    sc.close()

main()
