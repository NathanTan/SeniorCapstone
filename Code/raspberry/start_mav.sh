python connect.py
cd "./mjpg-streamer/mjpg-streamer-experimental/"
./mjpg_streamer -o "output_http.so -w ./www" -i "input_raspicam.so -x 400 -y 400 -fps 30 -ex night"
