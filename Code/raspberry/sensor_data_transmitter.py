# This program must be launched only after identifiying the IP address of the
# server, which is written to server-ip-address file.

# Execute this program as a background process.

import os
import time
import socket
import random
import json
import sys
import maxSonarTTY
import sensor_data_generator as sdg

SERVER_IP_FNAME = "server-ip-address"
PORT = 57903 # This port is for sensor feed

ULTRASONIC_DEVICE1 = "/dev/ttyAMA0"

start_time = time.time()

# Modify this callback to return the data you need
# @return Assumes this callback function returns a dictionary
def getData():
    time.sleep(0.02) # just for fun but also VERY important

    dt = (time.time() - start_time) * 10.0

    data = {}
    #data["speed"] = random.randint(0, 1000)
    data["speed"] = sdg.getSpeed(dt)
    data["bottomSonarRange"] = sdg.getHeight(dt)
    data["leftSonarRange"] = sdg.getLeftSonarRange(dt)
    data["rightSonarRange"] = sdg.getRightSonarRange(dt)
    data["frontSonarRange"] = sdg.getFrontSonarRange(dt)
    data["sideTilt"] = sdg.getAttitide(dt)
    data["forwardTilt"] = sdg.getForwardTilt(dt)

    #try:
        #data["height"] = maxSonarTTY.measure(ULTRASONIC_DEVICE1)
    #except Exception as err:
        #print("Error: {0}".format(err))
        #data["height"] = -1
        #pass

    # From the gyro and accelerometer, we need sideTiltAngle, forwardTileAngle, velocity vector [x, y, z]
    # For the range sensors we need leftSonarRange, rightSonarRange, frontSonarRange, and bottomSonarRange

    # Get data here
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
        sc.sendto(json.dumps(getData()).encode("utf-8"), (server_ip, PORT))
        #print("sent data to " + server_ip + " : " + str(PORT))
        #sys.stdout.flush()

    sc.close()

main()
