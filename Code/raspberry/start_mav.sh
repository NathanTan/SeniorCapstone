export SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

# Launch connector
cd $SCRIPTPATH
python connect.py &
echo $! > spawned-processes

# Stream bottom feed
cd "./mjpg-streamer/mjpg-streamer-experimental/"
./mjpg_streamer -o "output_http.so -w ./www -p 8080" -i "input_raspicam.so -x 400 -y 400 -fps 30 -ex night" &
cd $SCRIPTPATH
echo $! >> spawned-processes

# Stream front feed
cd "./mjpg-streamer/mjpg-streamer-experimental/"
./mjpg_streamer -o "output_http.so -w ./www -p 8081" -i "input_raspicam.so -x 1920 -y 1080 -fps 30 -ex night" &
cd $SCRIPTPATH
echo $! >> spawned-processes
