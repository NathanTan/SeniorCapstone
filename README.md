# Senior Capstone
A repository to host all of group 14's work towards the 2019 Vertical Flight Society's student Micro Air Vehicle competition.


# CS Team
Anton Synytsia<br/>
Matthew Phillips<br/>
Shanmukh Challa<br/>
Nathan Tan<br/>


# Setting Up Raspberry Pi

There are two parts for setting up the Raspberry Pi. The first part focuses on setting up Raspbian and configuring Wifi network on your Raspbian. The second part describes how to setup our code on Raspbian.

## Raspbian and Wifi Network

1. Setup Raspbian Stretch Lite on your Raspberry Pi: https://www.raspberrypi.org/documentation/installation/installing-images/
2. Connect Raspberry Pi to a Wifi network. Both the server and the Raspberry Pi will have to be connected to a common Wifi network for UDP communication to work. There are two ways to setup Wifi network on your Raspbian:
   * Setup WIFI by editing SD card: https://howchoo.com/g/ndy1zte2yjn/how-to-set-up-wifi-on-your-raspberry-pi-without-ethernet
   * Setup WIFI by hooking keyboard and display to the Raspberry Pi and then modifying within the Raspbian kernel: https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md
3. To access Raspberry Pi, you can ssh into it with IP address or through an Ethernet cable: https://howchoo.com/g/ote0ywmzywj/how-to-enable-ssh-on-raspbian-without-a-screen
   To connect via IP address, you can use nmap to search for Raspberry Pi in your network"
   ```bash
   nmap -sn 192.168.0.1/16 # 192.168.0.1 is LAN Wi-Fi default gateway (obtained by ifconfig or ipconfig)
   ```
   Provided that you have the ip address, you can then ssh with the following:
   ```bash
   ssh pi@192.168.0.120
   ```
   Note that you will first have to wait like 30 seconds after bootup before searching for IP or ssh-ing into Raspberry Pi.


## Setting Up Code

The following section describes the steps you have to perform on your Raspberry Pi Raspbian kernel:

1. Upload <tt>/Code/raspberry</tt> folder to your Raspberry Pi's home directory, so that the path is resembled in the following way:
   <tt>/home/pi/raspberry/</tt>

2. Add execute permissions to all of the added files:
   ```bash
   chmod -R 755 /home/pi/raspberry
   ```

3. Clone/download mjpg-streamer to <tt>/home/pi/raspberry</tt> folder:
   ```bash
   cd /home/pi/raspberry
   sudo git clone https://github.com/jacksonliam/mjpg-streamer.git
   ```
   If git is not available on your Raspbian, you can install it like this:
   ```bash
   sudo apt-get install git
   ```

4. Compile mjpg-streamer (the actual steps were taken from https://github.com/jacksonliam/mjpg-streamer):
   1. First install the required packages:
      ```bash
      sudo apt-get update # This is recommended!
      sudo apt-get install cmake libjpeg8-dev
      sudo apt-get install gcc g++
      ```
   2. Then compile:
      ```bash
      cd /home/pi/raspberry/mjpg-streamer/mjpg-streamer-experimental
      make
      sudo make install
      ```

5. This step is optional. When your Raspberry Pi boots up, you can have it run the script automatically.
   This section describes how to setup rc.local boot script to run <tt>start_mav.sh</tt>:
   1. Optional: install vim:
      ```bash
      sudo apt-get install vim
      ```

   2. Open <tt>/etc/rc.local</tt>:
      ```bash
      sudo vim /etc/rc.local
      ```

   3. Add the following at the very end of the file, before the <tt>exit 0</tt> command:
      ```bash
      sleep 1s && /home/pi/raspberry/start_mav.sh & # 1s delay is crucial to let pi to connect to wifi first
      ```


# Starting Raspberry Pi

When you turn on Raspberry Pi, the boot up script should automatically run the <tt>start_mav.sh</tt> script. If you want to run manually, refer to the instructions below. Note that you may want to first terminate the current running MAV script, which can be done by running the <tt>stop_mav.sh</tt> script.

Provided both, the Raspberry Pi and the server, are in a common network, when starting a server, also run the following from the Raspberry Pi:
```bash
sudo /home/pi/raspberry/start_mav.sh
```

After ending the server, run the following from the Raspberry Pi to kill all the spawned processes:
```bash
sudo /home/pi/raspberry/stop_mav.sh
```


# Setting Up Server
Provided that NodeJS is installed and the repository is cloned to your Laptop/PC, run the following:
```bash
cd /Code/
npm i
```


# Starting Server
To start the server, run the following commands:
```bash
cd /Code/
npm start
```

When started, the server can be viewed at the following URL:
<tt>localhost:3000</tt>

To stop the server, trigger CONTROL-C in the console.


# How Raspberry-Server Communication Works
For the communication to work, both the server the Raspberry Pi need to be
connected to a common, local network. A custom router, with settings configured
to allow multicasting, is a perfect solution for a local network.

When the server and RPi is turned on, there needs to be a way for the server
and the RPi to become aware of each-others IP addresses to establish direct
communication.

One way to establish connection is by hard-coding host IP addresses for both,
the server and the RPi, code. This is not user-friendly, especially that the
MAV is expected to be operated/tested from different networks. Additionally,
we are not skiting to the same laptop and the same Raspberry Pi for performing
the communication. So, the IPs will alter continuously. To resolve this, we
developed a system for allowing the server to identify the IP address of the
RPi and the RPi to identify the IP address of the server.

To determine the IP addresses, the following protocol is established:

1. Upon booting up, the RPi initiates a UDP multicast listener for a maximum
   duration of 60 seconds. The UDP socket receives a multicast at a certain
   port, known to both, the server and the RPi.
2. When the server is launched, the server multicasts a special message, to the
   known port. The message is multicasted every 0.5 seconds, until a response is
   received from a RPi. The server also starts a listener for acquiring the
   response at a specific port.
3. Upon receiving a multicast message at the know port, the RPi saves the IP
   address of the anticipated server, stops the listener, and sends a response
   to the server's IP address, at a specific port, for a duration of 2 seconds,
   well to ensure the server receives a message.
4. Upon receiving a response from the RPi, the server saves the IP address of
   the RPi and initiates asynchronous video and sensor listeners.
5. After the RPi finishes echoing the response, the RPi initiates three
   background processes for transmitting video and sensor data to the MAV
   asynchronously.
6. The RPi also establishes a TCP connection with the server for receiving and
   transmitting the important bits. At the moment TCP, is commented out because
   well, it seems like NodeJS net TCP is not compatible with Python socket TCP.

This system requires that the router does not block WIFI multicast signals.
Multicast signal is a form of broadcast signal. For obvious reasons, school's
routers are very skeptical of broadcasts and block them. This means, we can only
operate this from configured home network or a custom router.


# LaTex Graphic Rules
When uploading graphics to overleaf, upload them in PNG format (preferably transparent background). When uploading the TEX document to repository, convert all graphics to EPS format with an online converter, and then within the TEX file replace <tt>.png</tt> with <tt>.eps</tt>.


# Generating PDF Documents
After uploading a <tt>TEX</tt> document, run the following commands:

```bash
cd FolderName # Design, Requirements, GroupProblemStatement, or ProgressReport
make
```

When compiled, the PDF document is copied to <tt>GeneratedPDF</tt> folder.

Before pushing the changes, run:

```bash
make clean
```

This will remove all the unnecessary files but leave the PDF in <tt>GeneratedPDF</tt> folder.
