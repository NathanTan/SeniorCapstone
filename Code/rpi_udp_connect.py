import socket
import datetime
import time
import sys

MAX_BROADCAST_RECEIVE_DURATION = 60 # in seconds
BROADCAST_RECEIVE_PORT = 57901
BROADCAST_RECEIVE_MESSAGE = "Beaver-Hawks1"

SERVER_RESPONCE_DURATION = 3 # in seconds
SERVER_RESPONSE_TIMEOUT = 0.1 # in seconds
SERVER_RESPONSE_PORT = 57902
SERVER_RESPONSE_MESSAGE = "Beaver-Hawks2"

# Listen for broadcast for at most BROADCAST_RECEIVE_DURATION seconds
sc = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sc.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sc.setsockopt(socket.SOL_SOCKET, socket.SO_RCVTIMEO, 1000)
sc.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
sc.bind(('', BROADCAST_RECEIVE_PORT))

server_ip = None
start_time = time.time()
while True:
    try:
        data, address = sc.recvfrom(1024)
        if data.decode("utf-8") == BROADCAST_RECEIVE_MESSAGE:
            server_ip = address[0]
            print(address)
            sys.stdout.flush()
            break
    except TimeoutError:
        pass
    elapsed = time.time() - start_time
    if elapsed >= MAX_BROADCAST_RECEIVE_DURATION:
        break

# Validate
if server_ip is None:
    raise TimeoutError("Did not receive any requests from server within " + str(MAX_BROADCAST_RECEIVE_DURATION) + " seconds.")

# Send a response to the server
sc.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 0)
start_time = time.time()
while True:
    sc.sendto(SERVER_RESPONSE_MESSAGE.encode("utf-8"), (server_ip, SERVER_RESPONSE_PORT))
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
# socket protocols for sending out the feed.

f = open("server-ip-address", "w")
f.write(server_ip)
f.close()
