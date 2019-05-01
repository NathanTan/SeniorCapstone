#!/usr/bin/python
import smbus
import math


#Registers for power management
power_mgmt_1 = 0x6b
power_mgmt_2 = 0x6c

#Read data from sensor
def read_byte(reg):
    return bus.read_byte_data(address, reg)

def read_word(reg):
    h = bus.read_byte_data(address, reg)
    l = bus.read_byte_data(address, reg+1)
    value = (h << 8) + l
    return value

def read_word_2c(reg):
    val = read_word(reg)
    if (val >= 0x8000):
        return -((65535 - val) + 1)
    else:
        return val

#Functions to obtain the turn from original axes
def dist(a,b):
    return math.sqrt((a*a)+(b*b))

def get_y_rotation(x,y,z):
    radians = math.atan2(x, dist(y,z))
    return -math.degrees(radians)

def get_x_rotation(x,y,z):
    radians = math.atan2(y, dist(x,z))
    return math.degrees(radians)

def get_z_rotation(x,y,z):
    radians = math.atan2(z, dist(x,y))
    return math.degrees(radians)

#Write byte to obtain
bus = smbus.SMBus(1)
address = 0x68
bus.write_byte_data(address, power_mgmt_1, 0)

#Output data to the screen
g_x = read_word_2c(0x43)
g_y = read_word_2c(0x45)
g_z = read_word_2c(0x47)

print
print "Accelerometer"
print "---------------------"

a_x = read_word_2c(0x3b)
a_y = read_word_2c(0x3d)
a_z = read_word_2c(0x3f)

a_xs = a_x / 16384.0
a_ys = a_y / 16384.0
a_zs = a_z / 16384.0

print "Accel (X axis): ", a_xs
print "Accel (Y axis): ", a_ys
print "Accel (Z axis): ", a_zs

print
print "Rotation"
print "----------------------"

print "X Rotation: " , get_x_rotation(a_xs, a_ys, a_zs)
print "Y Rotation: " , get_y_rotation(a_xs, a_ys, a_zs)
print "Z Rotation: " , get_z_rotation(a_xs, a_ys, a_zs)
