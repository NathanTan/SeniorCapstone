from time import sleep
import maxSonarTTY

serialPort = "/dev/ttyAMA0"
sleepTime = 1

while True:
    mm = maxSonarTTY.measure(serialPort)
    print mm,; print "inches"
    sleep(sleepTime)