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

import smbus
import time

#import RPi.GPIO as gpio

PWR_M = 0x06
INT_EN = 0x17

GYRO_X = 0x33
GYRO_Y = 0x35
GYRO_Z = 0x37
ACCEL_X = 0x2D
ACCEL_Y = 0x2F
ACCEL_Z = 0x31

bus = smbus.SMBus(1)

Device_Address = 0x68 #device address
GxCal = 0
GyCal = 0
GzCal = 0
AxCal = 0
AyCal = 0
AzCal = 0

def InitICM():
    #bus.write_byte_data(Device_Address, PWR_M, 1)
    bus.write_byte_data(Device_Address, INT_EN, 1)
    time.sleep(1)

def readICM(addr):
    high = bus.read_byte_data(Device_Address, addr)
    low = bus.read_byte_data(Device_Address, addr+1)
    value = ((high << 8) | low)
    if(value > 32768):
        value = value - 65536
    return value

def gyro():
    x = readICM(GYRO_X)
    y = readICM(GYRO_Y)
    z = readICM(GYRO_Z)
    Gx = x/131.0 - GxCal
    Gy = y/131.0 - GyCal
    Gz = z/131.0 - GzCal
    #print ("Gx "),; print (Gx)
    #print ("Gy "),; print (Gy)
    #print ("Gz "),; print (Gz)
    return [Gx, Gy, Gz]

def accel():
    x = readICM(ACCEL_X)
    y = readICM(ACCEL_Y)
    z = readICM(ACCEL_Z)
    Ax = x/16384.0 - AxCal
    Ay = y/16384.0 - AyCal
    Az = z/16384.0 - AzCal
    #print ("Ax "),; print (Ax)
    #print ("Ay "),; print (Ay)
    #print ("Az "),; print (Az)
    return [Ax, Ay, Az]

def calibrate():
    global AxCal
    global AyCal
    global AzCal
    x = 0
    y = 0
    z = 0
    for i in range(50):
        x = x + readICM(ACCEL_X)
        y = y + readICM(ACCEL_Y)
            z = z + readICM(ACCEL_Z)
    x = x/50
    y = y/50
    z = z/50
    AxCal = x/16384.0
    AyCal = y/16384.0
    AzCal = z/16384.0

    global GxCal
    global GyCal
    global GzCal
    x = 0
    y = 0
    z = 0
    for i in range(50):
        x = x + readICM(GYRO_X)
        y = y + readICM(GYRO_Y)
        z = z + readICM(GYRO_Z)
    x = x/50
    y = y/50
    z = z/50
    GxCal = x/131.0
    GyCal = y/131.0
    GzCal = z/131.0


sideTiltAngle = 0;


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
    InitICM()
    gyro()
    accel()

    sideTiltAngle += gyro[0] # Update angle based on change (dont know if this is right)

    data["sideTiltAngle"] = sideTiltAngle

    # From the gyro and accelerometer, we need sideTiltAngle, forwardTileAngle, velocity vector [x, y, z]
    # For the range sensors we need leftSonarRange, rightSonarRange, frontSonarRange, and bottomSonarRange

    height += 1

    # Get data here
    return data


def main():
    # Init sensors and gyro
    InitICM()
    calibrate()

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
