# Senior Capstone
A repository to host all of group 14's work towards the 2019 Vertical Flight Society's student Micro Air Vehicle competition.

# CS Team
Anton Synytsia<br/>
Matthew Phillips<br/>
Shanmukh Challa<br/>
Nathan Tan<br/>

# Starting Server
```bash
cd Code/
npm i
npm start
```

# Setting Up Raspberry Pi
1. Upload the <tt>/Code/raspberry</tt> folder into your Raspberry Pi's home directory.

2. Add execute permissions to all files in raspberry directory:
```bash
cd Code/raspberry
cd chmod -R 755 raspberry
```

3. Clone the following repository into your Raspberry Pi and follow instructions for
   compiling: https://github.com/jacksonliam/mjpg-streamer


# Starting Raspberry Pi

Provided, both the raspberry pi and the server are in a common network, when starting a server, also run the following from the Raspberry Pi:
```bash
cd Code/raspberry/
./start_mav.sh
```

After ending the server, run the following from the Raspberry Pi to kill all the spawned background processes:
```bash
cd Code/raspberry/
./stop_mav.sh
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
