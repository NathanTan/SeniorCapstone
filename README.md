# Senior Capstone
A repository to host all of group 14's work towards the 2019 Vertical Flight Society's student Micro Air Vehicle competition.


# CS Team
Anton Synytsia<br/>
Matthew Phillips<br/>
Shanmukh Challa<br/>
Nathan Tan<br/>


# Setting Up Raspberry Pi
1. Upload <tt>/Code/raspberry</tt> folder to your Raspberry Pi's home directory, so that the path looks like this: <tt>/home/pi/raspberry/</tt>

2. Add execute permissions to all of the added files:
    ```bash
    cd chmod -R 755 /home/pi/raspberry
    ```

3. Clone mjpg-streamer to <tt>/home/pi/raspberry</tt> folder:
    ```bash
    cd /home/pi/raspberry
    git clone git@github.com:jacksonliam/mjpg-streamer.git
    ```

4. Compile mjpg-streamer: https://github.com/jacksonliam/mjpg-streamer

5. Setup rc.local boot-up script to run <tt>/home/pi/raspberry/start_mav.sh</tt>:

    A. Open <tt>/etc/rc.local</tt>:
    ```bash
    vim /etc/rc.local
    ```

    B. Add the following at the very end of the file, before the exit command:
    ```bash
    /home/pi/raspberry/start_mav.sh
    ```


# Setting Up Server
```bash
cd /Code/
npm i
```

# Starting Server
```bash
cd /Code/
npm start
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
