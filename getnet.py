import socket
# https://stackoverflow.com/a/30990617
def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    return s.getsockname()[0]
	sc1.close()

print(get_ip_address())