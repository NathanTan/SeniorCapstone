import socket

udp_ip = b"192.168.0.118"
udp_port = 57900
msg = "Hello, this is a message from python."

print("UDP target IP:", udp_ip)
print("UDP target port:", udp_port)
print("message:", msg)

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(msg.encode("utf-8"), (udp_ip, udp_port))
