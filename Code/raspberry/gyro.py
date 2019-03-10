import smbus
import time

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
	bus.write_byte_data(Device_Address, PWR_M, 1)
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
	print ("Gx "),; print (Gx)
	print ("Gy "),; print (Gy)
	print ("Gz "),; print (Gz)
	time.sleep(0.01)

def accel():
	x = readICM(ACCEL_X)
	y = readICM(ACCEL_Y)
	z = readICM(ACCEL_Z)
	Ax = x/16384.0 - AxCal
	Ay = y/16384.0 - AyCal
	Az = z/16384.0 - AzCal
	print ("Ax "),; print (Ax)
	print ("Ay "),; print (Ay)
	print ("Az "),; print (Az)
	time.sleep(0.01)

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


print("ICM20948")
InitICM()
calibrate()
for i in range(10):
	InitICM()
	time.sleep(1)
	gyro()
	accel()
	print(" ")

	