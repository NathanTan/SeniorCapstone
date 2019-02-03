import socket
import struct
import sys
import time

message = 'very important data'
multicast_group = ('239.192.0.1', 57901)

# Create the datagram socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Set a timeout so the socket does not block indefinitely when trying
# to receive data.
sock.settimeout(1)

# Set the time-to-live for messages to 1 so they do not go past the
# local network segment.
ttl = struct.pack('b', 10)
sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, ttl)

try:
    while True:
        # Send data to the multicast group
        print >>sys.stderr, 'sending "%s"' % message
        sent = sock.sendto(message, multicast_group)
        sys.stdout.flush()
        time.sleep(0.1) # just for fun

finally:
    print >>sys.stderr, 'closing socket'
    sock.close()