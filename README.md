# Senior Capstone
A repository to host all of group 14's work towards the 2019 Vertical Flight Society's student Micro Air Vehicle competition.


# CS Team
Anton Synytsia<br/>
Matthew Phillips<br/>
Shanmukh Challa<br/>
Nathan Tan<br/>


# Setting Up Raspberry Pi
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
   git clone git@github.com:jacksonliam/mjpg-streamer.git
   ```
   If git is not available on your Raspbian, you can install it like this:
   ```bash
   sudo apt-get install git
   ```

4. Compile mjpg-streamer (the actual steps were taken from https://github.com/jacksonliam/mjpg-streamer):
   1. First install the required packages:
      ```bash
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
   1. Open <tt>/etc/rc.local</tt>:
      ```bash
      vim /etc/rc.local
      ```

   2. Add the following at the very end of the file, before the exit command:
      ```bash
      /home/pi/raspberry/start_mav.sh
      ```


# Starting Raspberry Pi

When you turn on Raspberry Pi, the boot up script should automatically run the <tt>start_mav.sh</tt> script. If you want to run manually, refer to the instructions below. Note that you may want to first terminate the current running MAV script, which can be done by running the <tt>stop_mav.sh</tt> script.

Provided both, the Raspberry Pi and the server, are in a common network, when starting a server, also run the following from the Raspberry Pi:
```bash
/home/pi/raspberry/start_mav.sh
```

After ending the server, run the following from the Raspberry Pi to kill all the spawned processes:
```bash
/home/pi/raspberry/stop_mav.sh
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
For the communication to work, both, the server the Raspberry Pi, need to be
connected to a common, local network. A custom router with settings configured
to allow multicasting, is a perfect solution for a local network.

When the server and RPi is turned on, there needs to be a way for the server
and the RPi to become aware of each-others IP addresses.

One way to establish connection is by updating host IP addresses manually,
for both the server and the RPi code. This is not user-friendly, especially
since the MAV is going to be operated from different networks.

To determine the IP addresses, the following protocol is established:
1. Upon booting up, the RPi initiates a UDP multicast listener, for a
   maximum of 60 seconds. The listener receives a multicast at a certain port,
   known to both the server and the RPi.
2. When the server is launched, the server multicasts a special message, to the
   known port. The message is multicasted every 0.5 secods, until a response is
   received from a RPi.
3. The server also starts a listener for acquiring the response at a specific
   port.
4. Upon receiving a multicast message from the server, the RPi saves the IP
   address of the server, stops the listener, and sends a response to the
   server's IP address for a duration of 2 seconds, to ensure that the server
   receives the message.
5. Upon receiving the response, the server saves the IP address and initiates
   video and sensor listeners.
6. After echoing a response for 2 seconds, the RPi initiates three background
   processes for transmitting video and sensor data to the MAV asynchronously.
7. Following that, the RPi also establishes a TCP connection with the server for
   receiving and transmitting the important bits. At the moment TCP, is
   commented out because well, it seems like NodeJS net TCP is not compatible
   with Python socket TCP.


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
