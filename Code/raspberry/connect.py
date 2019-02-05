import socket
import datetime
import time
import sys
import struct
import os
import subprocess
import atexit
import json

SERVER_IP_FNAME = "server-ip-address"
SPAWNED_PROCESSES_FNAME = "spawned-processes"

# https://www.iana.org/assignments/multicast-addresses/multicast-addresses.xhtml
MULTICAST_ADDRESS = "239.192.0.1"
MAX_MULTICAST_RECEIVE_DURATION = 60 # in seconds
MULTICAST_RECEIVE_PORT = 57901
MULTICAST_RECEIVE_MESSAGE = "Beaver-Hawks1"

SERVER_RESPONCE_DURATION = 2 # in seconds
SERVER_RESPONSE_TIMEOUT = 0.1 # in seconds
SERVER_RESPONSE_PORT = 57902
SERVER_RESPONSE_MESSAGE = "Beaver-Hawks2"

TCP_PORT = 57800

# Do something with data here.
def doOnTCPReceive(data):
    if 'lights' in data:
        # Control LEDs
        print(data['lights'])
    if 'speaker' in data:
        # Control Speaker
        print(data['speaker'])
    sys.stdout.flush()


def main():
    # First remove the original server-ip-address file
    if os.path.exists(SERVER_IP_FNAME):
        os.remove(SERVER_IP_FNAME)

    # Listen for multicast for at most MULTICAST_RECEIVE_DURATION seconds
    sc1 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sc1.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    sc1.bind(("", MULTICAST_RECEIVE_PORT))

    group = socket.inet_aton(MULTICAST_ADDRESS)
    mreq = struct.pack("4sl", group, socket.INADDR_ANY)
    sc1.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

    sc1.settimeout(1.0)

    print("Listening for data at " + MULTICAST_ADDRESS + ":" + str(MULTICAST_RECEIVE_PORT))
    server_ip = None
    start_time = time.time()
    while True:
        try:
            data, address = sc1.recvfrom(1024)
            msg = data.decode("utf-8")
            if msg == MULTICAST_RECEIVE_MESSAGE:
                server_ip = address[0]
                print("Request received from: " + str(address[0]) + ":" + str(address[1]) + " - " + msg)
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

    # What we'll do is create a file to store server's IP address.
    # Other processes can open this file, read the IP, and use the IP in their
    # socket protocols for shipping the data.
    f = open(SERVER_IP_FNAME, "w")
    f.write(server_ip)
    f.close()

    # Send a response to the server
    print("Sending response to " + str(server_ip) + ":" + str(SERVER_RESPONSE_PORT))
    sc2 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sc2.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
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

    print("Launch subprocesses")

    # Start data transmission processies
    processes = []
    processes.append(subprocess.Popen(["python", "sensor_data_transmitter.py"]))
    #processes.append(subprocess.Popen(["python", "video_transmitter1.py"]))
    #processes.append(subprocess.Popen(["python", "video_transmitter2.py"]))

    # Save processes to file for termination
    f = open(SPAWNED_PROCESSES_FNAME, "w+")
    for proc in processes:
        f.write(str(proc.pid) + "\n")
    f.close()

"""
    # Establish TCP connection for communicating important bits until the connection is terminated
    print("Start TCP connection")
    sc3 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sc3.bind(("", TCP_PORT))
        sc3.listen(1)
        conn, addr = sc3.accept()

        # Listen for data until connection terminates
        while True:
            try:
                buf = conn.recv(1024)
                try:
                    data = json.loads(buf.decode("utf-8"))
                    doOnTCPReceive(data)
                except:
                    pass
            except OSError:
                conn.close()
                break

    except OSError:
        sc3.close()
        raise

    print("End TCP connection")

    # Kill spawned processes
    for proc in processes:
        try:
            proc.kill()
        except:
            pass

    # Delete the spawned processes file, since we already killed the processes at this point.
    if os.path.exists(SPAWNED_PROCESSES_FNAME):
        os.remove(SPAWNED_PROCESSES_FNAME)

"""

main()
