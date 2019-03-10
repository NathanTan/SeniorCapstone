# This program must be launched only after identifiying the IP address of the
# server, which is written to server-ip-address file.

# Execute this program as a background process.

import os
import time
import socket
import random
import json
import sys

SERVER_IP_FNAME = "server-ip-address"
PORT = 57903 # This port is for sensor feed

height = 0

# Modify this callback to return the data you need
# @return Assumes this callback function returns a dictionary
def getData():
    global height
    global sideTiltAngle
    time.sleep(0.02) # just for fun but also VERY important
    data = {}
    data["speed"] = random.randint(0, 1000)
    data["height"] = height

    # Cassie's code calls InitICM() each time before getting gyro and accelerometer data
    # I also added this to main() function, see below.
    """
    InitICM()
    gyro()
    accel()

    sideTiltAngle += gyro[0] # Update angle based on change (dont know if this is right)

    data["sideTiltAngle"] = sideTiltAngle
    """

    # From the gyro and accelerometer, we need sideTiltAngle, forwardTileAngle, velocity vector [x, y, z]
    # For the range sensors we need leftSonarRange, rightSonarRange, frontSonarRange, and bottomSonarRange

    height += 1

    # Get data here
    return data


def main():
    """
    # Init sensors and gyro
    InitICM()
    calibrate()
    """

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
        sc.sendto(json.dumps(getData()).encode("utf-8"), (server_ip, PORT))
        #print("sent data to " + server_ip + " : " + str(PORT))
        #sys.stdout.flush()

    sc.close()

main()
